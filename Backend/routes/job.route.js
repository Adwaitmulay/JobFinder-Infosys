import express from "express";

import {
  addDemoJobs,
  getJobFilters
} from "../controllers/job.controller.js";

import { matchJobs } from "../controllers/smartMatch.controller.js";

const router = express.Router();

router.route("/demo").post(addDemoJobs);
router.route("/match").get(matchJobs);
router.route("/filters").get(getJobFilters);

export default router;
