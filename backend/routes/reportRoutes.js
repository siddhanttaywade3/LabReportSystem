const express = require("express");
const mongoose = require("mongoose");
const Report = require("../models/Report");
const Patient = require("../models/Patient");
const Test = require("../models/Test");

const router = express.Router();

function handleError(res, error) {
  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({ message: error.message });
  }

  console.error("Report API error:", error);

  return res.status(500).json({
    message: "Unable to complete the request.",
  });
}

// Create a draft report with blank results
router.post("/", async (req, res) => {
  try {
    const {
      patientId,
      testIds,
      referredBy,
      sampleCollectedAt,
    } = req.body || {};

    if (!mongoose.isObjectIdOrHexString(patientId)) {
      return res.status(400).json({
        message: "A valid patient ID is required.",
      });
    }

    if (
      !Array.isArray(testIds) ||
      testIds.length === 0 ||
      !testIds.every((id) => mongoose.isObjectIdOrHexString(id))
    ) {
      return res.status(400).json({
        message: "Select at least one valid test.",
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found.",
      });
    }

    const uniqueIds = [
      ...new Set(testIds.map((id) => id.toLowerCase())),
    ];

    const tests = await Test.find({
      _id: { $in: uniqueIds },
      isActive: true,
    });

    if (tests.length !== uniqueIds.length) {
      return res.status(400).json({
        message: "One or more tests are missing or inactive.",
      });
    }

    const testsById = new Map(
      tests.map((test) => [test._id.toString(), test])
    );

    const reportTests = uniqueIds.map((id) => {
      const test = testsById.get(id);

      return {
        test: test._id,
        testName: test.name,
        results: test.parameters.map((parameter) => ({
          parameterName: parameter.name,
          result: "",
          unit: parameter.unit,
          referenceRange: parameter.referenceRange,
        })),
      };
    });

    const report = await Report.create({
      patient: patient._id,
      referredBy,
      sampleCollectedAt,
      tests: reportTests,
      status: "Draft",
    });

    res.status(201).json(report);
  } catch (error) {
    handleError(res, error);
  }
});

// List reports, newest first
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("patient")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    handleError(res, error);
  }
});

// View one report
router.get("/:id", async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({
      message: "Invalid report ID.",
    });
  }

  try {
    const report = await Report.findById(req.params.id)
      .populate("patient");

    if (!report) {
      return res.status(404).json({
        message: "Report not found.",
      });
    }

    res.json(report);
  } catch (error) {
    handleError(res, error);
  }
});

// Save manually entered results in a draft report
router.patch("/:id/results", async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({
      message: "Invalid report ID.",
    });
  }

  try {
    const { updates } = req.body || {};

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        message: "Provide at least one result update.",
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found.",
      });
    }

    if (report.status !== "Draft") {
      return res.status(400).json({
        message: "Only draft reports can be edited.",
      });
    }

    // Validate every update before applying changes
    for (const update of updates) {
      if (
        !update ||
        !Number.isInteger(update.testIndex) ||
        !Number.isInteger(update.parameterIndex) ||
        update.testIndex < 0 ||
        update.parameterIndex < 0 ||
        typeof update.result !== "string"
      ) {
        return res.status(400).json({
          message: "Each update needs valid indexes and a text result.",
        });
      }

      const test = report.tests[update.testIndex];

      if (!test || !test.results[update.parameterIndex]) {
        return res.status(400).json({
          message: "Test or parameter not found in this report.",
        });
      }
    }

    // Update result values only
    for (const update of updates) {
      report.tests[update.testIndex]
        .results[update.parameterIndex]
        .result = update.result.trim();
    }

    await report.save();

    res.json(report);
  } catch (error) {
    handleError(res, error);
  }
});
// Complete a report after all results have been entered
router.patch("/:id/complete", async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({
      message: "Invalid report ID.",
    });
  }

  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found.",
      });
    }

    if (report.status !== "Draft") {
      return res.status(400).json({
        message: "This report is already completed.",
      });
    }

    if (
      report.tests.length === 0 ||
      report.tests.some((test) => test.results.length === 0)
    ) {
      return res.status(400).json({
        message: "The report must contain tests with parameters.",
      });
    }

    const missingResults = [];

    for (const test of report.tests) {
      for (const parameter of test.results) {
        if (!parameter.result || !parameter.result.trim()) {
          missingResults.push(
            `${test.testName}: ${parameter.parameterName}`
          );
        }
      }
    }

    if (missingResults.length > 0) {
      return res.status(400).json({
        message: `Enter and save the missing results: ${missingResults.join(", ")}`,
      });
    }

    report.status = "Completed";
    await report.save();
    await report.populate("patient");

    res.json(report);
  } catch (error) {
    handleError(res, error);
  }
});
module.exports = router;