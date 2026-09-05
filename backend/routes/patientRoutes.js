const express = require("express");
const Patient = require("../models/Patient");
const router = express.Router();

// Add a patient
router.post("/", async (req, res) => {
  try {
    const { name, age, ageUnit, gender, phone, address } = req.body;

    const patient = await Patient.create({
      name,
      age,
      ageUnit,
      gender,
      phone,
      address,
    });

    res.status(201).json(patient);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Add patient failed:", error);
    res.status(500).json({
      message: "Unable to add patient.",
    });
  }
});

// Get all patients, newest first
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error("Fetch patients failed:", error);
    res.status(500).json({
      message: "Unable to fetch patients.",
    });
  }
});

module.exports = router;