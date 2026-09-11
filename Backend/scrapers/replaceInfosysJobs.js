import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import connectDB from "../utils/db.js";
import { Job } from "../models/job.model.js";
import { scrapeInfosysJobs } from "./infosysCareerScraper.js";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, "..", "infosys-real-jobs.json");

async function replaceDatabase() {
  await connectDB();

  const jobs = await scrapeInfosysJobs();

  console.log("Removing every previously imported JobFinder job...");
  const deleted = await Job.deleteMany({});
  console.log(`Deleted ${deleted.deletedCount} old jobs.`);

  if (!jobs.length) {
    throw new Error("Infosys scraper returned 0 jobs. Database was cleared; do not continue.");
  }

  const now = new Date();
  const documents = jobs.map((job) => ({
    ...job,
    firstSeenAt: now,
    lastSeenAt: now,
    isActive: true,
  }));

  const inserted = await Job.insertMany(documents, { ordered: false });

  console.log("========================================");
  console.log("INFOSYS OFFICIAL CAREERS IMPORT COMPLETE");
  console.log(`Inserted: ${inserted.length}`);
  console.log("Source: Infosys Careers only");
  console.log("========================================");

  process.exit(0);
}

replaceDatabase().catch((error) => {
  console.error("Infosys replacement failed:", error);
  process.exit(1);
});
