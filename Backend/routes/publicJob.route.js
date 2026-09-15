import express from "express";
import { Job } from "../models/job.model.js";

const router = express.Router();

const normalize = (value = "") => String(value).trim().toLowerCase();

router.get("/match", async (req, res) => {
  try {
    const role = normalize(req.query.role || "");
    const skills = String(req.query.skills || "")
      .split(",")
      .map(normalize)
      .filter(Boolean);
    const location = String(req.query.location || "").trim();
    const company = String(req.query.company || "").trim();

    const filter = { isActive: true };

    if (company && normalize(company) !== "all companies") {
      filter.company = new RegExp(`^${company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    if (location && normalize(location) !== "all locations") {
      filter.location = {
        $regex: location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i"
      };
    }

    const jobs = await Job.find(filter).lean();

    const result = jobs.map((job) => {
      const title = normalize(job.title);
      const jobRole = normalize(job.role);
      const storedSkills = Array.isArray(job.skills)
        ? job.skills.map(normalize)
        : [];

      const matchedSkills = skills.filter((skill) =>
        storedSkills.some(
          (jobSkill) =>
            jobSkill === skill ||
            jobSkill.includes(skill) ||
            skill.includes(jobSkill)
        )
      );

      const skillMatchPercentage =
        skills.length === 0
          ? 100
          : Math.round((matchedSkills.length / skills.length) * 100);

      let roleScore = 0;

      if (!role || role === "any role") {
        roleScore = 100;
      } else if (title === role || jobRole === role) {
        roleScore = 100;
      } else if (title.includes(role) || jobRole.includes(role)) {
        roleScore = 85;
      }

      const matchScore = Math.round(
        skillMatchPercentage * 0.6 + roleScore * 0.4
      );

      return {
        ...job,
        matchScore,
        skillMatchPercentage,
        matchedSkills
      };
    });

    result.sort(
      (a, b) =>
        b.skillMatchPercentage - a.skillMatchPercentage ||
        b.matchScore - a.matchScore
    );

    res.json({
      status: true,
      totalJobs: result.length,
      jobs: result.slice(0, 100)
    });
  } catch (error) {
    console.error("Public job match error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to find matching jobs"
    });
  }
});

export default router;
