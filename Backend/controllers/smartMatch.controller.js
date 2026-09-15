import { Job } from "../models/job.model.js";

const normalize = (value = "") =>
  String(value || "").trim().toLowerCase();

const escapeRegex = (value = "") =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const NON_INDIA_COUNTRIES = [
  "malaysia",
  "romania",
  "bulgaria",
  "taiwan",
  "poland",
  "norway",
  "belgium",
  "netherlands",
  "sweden",
  "finland",
  "spain",
  "denmark",
  "thailand",
  "hong kong",
  "australia",
  "germany",
  "france",
  "ireland",
  "united kingdom",
  "uk",
  "usa",
  "united states",
  "canada",
  "singapore",
  "japan",
  "south korea",
  "new zealand",
  "philippines",
  "italy",
  "portugal",
  "czech",
  "switzerland",
  "austria"
];

const INDIA_CITIES = [
  "ahmedabad",
  "bengaluru",
  "bangalore",
  "bhopal",
  "chennai",
  "coimbatore",
  "delhi",
  "new delhi",
  "gurugram",
  "gurgaon",
  "hyderabad",
  "indore",
  "jaipur",
  "kochi",
  "kolkata",
  "lucknow",
  "mumbai",
  "nagpur",
  "nashik",
  "patna",
  "pune",
  "visakhapatnam",
  "noida",
  "greater noida",
  "vadodara",
  "surat",
  "chandigarh",
  "mangalore",
  "mysore",
  "mysuru",
  "bhubaneswar",
  "thiruvananthapuram",
  "trivandrum",
  "gurugram"
];

const INDIA_STATES = [
  "maharashtra",
  "karnataka",
  "tamil nadu",
  "telangana",
  "kerala",
  "west bengal",
  "gujarat",
  "madhya pradesh",
  "uttar pradesh",
  "rajasthan",
  "bihar",
  "odisha",
  "punjab",
  "haryana",
  "delhi",
  "andhra pradesh",
  "goa",
  "jharkhand",
  "chhattisgarh",
  "uttarakhand",
  "assam"
];

const COMMON_SKILLS = [
  "javascript",
  "typescript",
  "java",
  "python",
  "c++",
  "c",
  "react",
  "angular",
  "node.js",
  "nodejs",
  "html",
  "css",
  "sql",
  "mysql",
  "oracle",
  "mongodb",
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "devops",
  "git",
  "github",
  "machine learning",
  "artificial intelligence",
  "ai",
  "data science",
  "data engineering",
  "databricks",
  "spark",
  "power bi",
  "tableau",
  "sap",
  "salesforce",
  "cyber security",
  "cybersecurity",
  "testing",
  "automation"
];

const isIndiaJob = (job) => {
  const location = normalize(job.location);
  const text = normalize(
    `${job.title || ""} ${job.role || ""} ${job.description || ""}`
  );

  const hasForeignCountry = NON_INDIA_COUNTRIES.some((country) =>
    text.includes(country)
  );

  if (hasForeignCountry) {
    return false;
  }

  if (location === "india") {
    return true;
  }

  if (
    INDIA_CITIES.some((city) => location.includes(city)) ||
    INDIA_STATES.some((state) => location.includes(state))
  ) {
    return true;
  }

  return false;
};

const getDetectedSkills = (job) => {
  const stored = Array.isArray(job.skills) ? job.skills : [];

  const text = normalize(
    `${job.title || ""} ${job.role || ""} ${job.description || ""}`
  );

  const detected = COMMON_SKILLS.filter((skill) =>
    text.includes(skill)
  );

  return [...new Set([...stored.map(normalize), ...detected])];
};

export const matchJobs = async (req, res) => {
  try {
    const role = String(req.query.role || "").trim();
    const skills = String(req.query.skills || "")
      .split(",")
      .map(normalize)
      .filter(Boolean);

    const location = String(req.query.location || "").trim();
    const company = String(req.query.company || "").trim();

    const filter = {
      isActive: true,
      sourceType: "official_company_careers"
    };

    if (
      company &&
      normalize(company) !== "all companies"
    ) {
      filter.company = new RegExp(
        `^${escapeRegex(company)}$`,
        "i"
      );
    }

    const rawJobs = await Job.find(filter).lean();

    const indiaJobs = rawJobs.filter(isIndiaJob);

    const requestedRole = normalize(role);
    const anyRole =
      !requestedRole ||
      requestedRole === "any role";

    const requestedLocation = normalize(location);
    const anyLocation =
      !requestedLocation ||
      requestedLocation === "india" ||
      requestedLocation === "all locations";

    const matchedJobs = indiaJobs
      .map((job) => {
        const title = normalize(job.title);
        const jobRole = normalize(job.role);

        const jobText = normalize(
          `${job.title || ""} ${job.role || ""} ${job.description || ""}`
        );

        const detectedSkills = getDetectedSkills(job);

        const matchedSkills = skills.filter((skill) =>
          detectedSkills.some(
            (jobSkill) =>
              jobSkill === skill ||
              jobSkill.includes(skill) ||
              skill.includes(jobSkill) ||
              jobText.includes(skill)
          )
        );

        const skillMatchPercentage =
          skills.length === 0
            ? 100
            : Math.round(
                (matchedSkills.length / skills.length) * 100
              );

        let roleMatchScore = 0;

        if (anyRole) {
          roleMatchScore = 100;
        } else if (
          title === requestedRole ||
          jobRole === requestedRole
        ) {
          roleMatchScore = 100;
        } else if (
          title.includes(requestedRole) ||
          jobRole.includes(requestedRole)
        ) {
          roleMatchScore = 90;
        } else {
          const roleWords = requestedRole
            .split(/\s+/)
            .filter((word) => word.length > 2);

          const matchedRoleWords = roleWords.filter((word) =>
            jobText.includes(word)
          );

          roleMatchScore =
            roleWords.length === 0
              ? 0
              : Math.round(
                  (matchedRoleWords.length / roleWords.length) * 70
                );
        }

        let locationMatched = true;
        let locationMatchType = "india";
        let locationScore = 15;

        if (!anyLocation) {
          const locationInText = requestedLocation;

          locationMatched =
            normalize(job.location).includes(locationInText) ||
            jobText.includes(locationInText);

          if (locationMatched) {
            locationMatchType = "city";
            locationScore = 25;
          }
        }

        const matchScore = Math.round(
          skillMatchPercentage * 0.55 +
          roleMatchScore * 0.30 +
          locationScore * 0.15
        );

        return {
          ...job,
          skills:
            Array.isArray(job.skills) && job.skills.length
              ? job.skills
              : detectedSkills,
          matchedSkills,
          skillMatchCount: matchedSkills.length,
          skillMatchPercentage,
          matchedRoleTerms: requestedRole
            ? requestedRole
                .split(/\s+/)
                .filter(
                  (word) =>
                    word.length > 2 &&
                    jobText.includes(word)
                )
            : [],
          roleMatchScore,
          locationMatched,
          locationMatchType,
          locationScore,
          detectedJobState: null,
          selectedState: null,
          matchScore
        };
      })
      .filter((job) =>
        anyLocation ? true : job.locationMatched
      );

    matchedJobs.sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        b.skillMatchPercentage - a.skillMatchPercentage ||
        b.roleMatchScore - a.roleMatchScore
    );

    res.json({
      status: true,
      totalJobs: matchedJobs.length,
      jobs: matchedJobs.slice(0, 100)
    });
  } catch (error) {
    console.error("Smart match error:", error);

    res.status(500).json({
      status: false,
      message: "Failed to find matching jobs"
    });
  }
};
