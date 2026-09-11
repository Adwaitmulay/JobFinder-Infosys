import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    jobType: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    jobUrl: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    // Where the job was collected from
    source: {
      type: String,
      required: true,
      index: true,
    },

    // ID given to the job by the company's ATS
    sourceJobId: {
      type: String,
      default: "",
    },

    sourceType: {
      type: String,
      default: "official_company_careers",
      index: true,
    },

    sourcePage: {
      type: String,
      default: "",
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    // First time our system saw this job
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },

    // Last time our scraper saw this job
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Used by the daily cron system
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model("Job", jobSchema);