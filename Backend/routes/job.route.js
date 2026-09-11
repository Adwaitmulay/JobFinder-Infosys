import express from "express";
import {
  addDemoJobs,
  matchJobs,
} from "../controllers/job.controller.js";

const router = express.Router();

// Add demo jobs
router.route("/demo").post(addDemoJobs);

// Find jobs matching user profile
router.route("/match").get(matchJobs);

export default router;