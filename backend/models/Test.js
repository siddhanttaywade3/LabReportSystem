const mongoose = require("mongoose");

const parameterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  unit: {
    type: String,
    trim: true,
    default: "",
  },
  referenceRange: {
    type: String,
    trim: true,
    default: "",
  },
  resultType: {
    type: String,
    enum: ["Number", "Text"],
    default: "Number",
  },
});

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sampleType: {
      type: String,
      trim: true,
      default: "",
    },
    parameters: {
      type: [parameterSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);