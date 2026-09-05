const express = require("express");
const mongoose = require("mongoose");
const Test = require("../models/Test");

const router = express.Router();

function handleError(res, error) {
  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({ message: error.message });
  }

  console.error("Test API error:", error);
  return res.status(500).json({
    message: "Unable to complete the request.",
  });
}

// Create a test
router.post("/", async (req, res) => {
  try {
    const { name, sampleType, parameters, isActive } = req.body;

    const test = await Test.create({
      name,
      sampleType,
      parameters,
      isActive,
    });

    res.status(201).json(test);
  } catch (error) {
    handleError(res, error);
  }
});

// List all tests
router.get("/", async (req, res) => {
  try {
    const tests = await Test.find().sort({ name: 1 });
    res.json(tests);
  } catch (error) {
    handleError(res, error);
  }
});

// Update a test
router.patch("/:id", async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ message: "Invalid test ID." });
  }

  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: "Test not found." });
    }

    const allowedFields = [
      "name",
      "sampleType",
      "parameters",
      "isActive",
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        test.set(field, req.body[field]);
      }
    }

    await test.save();
    res.json(test);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;