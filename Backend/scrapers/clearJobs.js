import dotenv from "dotenv";
import connectDB from "../utils/db.js";
import { Job } from "../models/job.model.js";

dotenv.config();

await connectDB();
const result = await Job.deleteMany({});
console.log(`Deleted ${result.deletedCount} JobFinder jobs.`);
process.exit(0);
