const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    parameterName: {
      type: String,
      required: true,
      trim: true,
    },
    result: {
      type: String,
      trim: true,
      default: "",
    },
    unit: {
      type: String,
      default: "",
    },
    referenceRange: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const reportTestSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    testName: {
      type: String,
      required: true,
    },
    results: {
      type: [resultSchema],
      default: [],
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    referredBy: {
      type: String,
      trim: true,
      default: "",
    },
    sampleCollectedAt: {
      type: String,
      enum: [
        "Collected in Lab",
        "Collected in Hospital",
        "Collected at Home",
        "Received from Outside",
      ],
      required: true,
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
    tests: {
      type: [reportTestSchema],
      validate: {
        validator: (tests) => tests.length > 0,
        message: "Select at least one test.",
      },
    },
    status: {
      type: String,
      enum: ["Draft", "Completed"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);