import { Job } from "../models/job.model.js";

/* --------------------------------------------------------------------------
   SKILL ALIASES
-------------------------------------------------------------------------- */

const SKILL_ALIASES = {
  js: "javascript",
  javascript: "javascript",
  javascriptjs: "javascript",
  ts: "typescript",
  typescript: "typescript",
  reactjs: "react",
  "react.js": "react",
  react: "react",
  node: "node.js",
  nodejs: "node.js",
  "node.js": "node.js",
  cpp: "c++",
  "c++": "c++",
  cplusplus: "c++",
  csharp: "c#",
  "c#": "c#",
  mongo: "mongodb",
  mongodb: "mongodb",
  postgres: "postgresql",
  postgresql: "postgresql",
  mysql: "mysql",
  aws: "aws",
  azure: "azure",
  gcp: "google cloud",
  "google cloud": "google cloud",
  angularjs: "angular",
  angular: "angular",
  vue: "vue.js",
  "vue.js": "vue.js",
  next: "next.js",
  "next.js": "next.js",
  spring: "spring",
  "spring boot": "spring boot",
  python: "python",
  java: "java",
  sql: "sql",
  ".net": ".net",
  dotnet: ".net",
  ml: "machine learning",
  "machine learning": "machine learning",
  ai: "artificial intelligence",
  "artificial intelligence": "artificial intelligence",
  "generative ai": "generative ai",
  genai: "generative ai",
  "cyber security": "cybersecurity",
  cybersecurity: "cybersecurity",
  "service now": "servicenow",
  servicenow: "servicenow",
  powerbi: "power bi",
  "power bi": "power bi",
  golang: "go",
  go: "go"
};

/* --------------------------------------------------------------------------
   STATE / CITY DATA
-------------------------------------------------------------------------- */

const INDIA_STATE_LOCATIONS = {
  "andhra pradesh": [
    "amaravati",
    "anantapur",
    "guntur",
    "kakinada",
    "nellore",
    "tirupati",
    "vijayawada",
    "visakhapatnam",
    "vizag"
  ],
  assam: ["guwahati"],
  bihar: ["patna"],
  chhattisgarh: ["bhilai", "bilaspur", "raipur"],
  goa: ["goa", "panaji"],
  gujarat: [
    "ahmedabad",
    "gandhinagar",
    "rajkot",
    "surat",
    "vadodara",
    "baroda"
  ],
  haryana: ["gurgaon", "gurugram", "faridabad", "panipat"],
  jharkhand: ["ranchi", "jamshedpur"],
  karnataka: [
    "bengaluru",
    "bangalore",
    "mysore",
    "mysuru",
    "mangalore",
    "hubli",
    "hubballi"
  ],
  kerala: [
    "kochi",
    "cochin",
    "thiruvananthapuram",
    "trivandrum",
    "kozhikode",
    "calicut"
  ],
  "madhya pradesh": [
    "bhopal",
    "indore",
    "jabalpur",
    "gwalior"
  ],
  maharashtra: [
    "mumbai",
    "pune",
    "nagpur",
    "nashik",
    "navi mumbai",
    "thane",
    "aurangabad",
    "chhatrapati sambhajinagar"
  ],
  odisha: ["bhubaneswar", "cuttack"],
  punjab: ["amritsar", "ludhiana", "mohali", "chandigarh"],
  rajasthan: ["jaipur", "jodhpur", "udaipur", "kota"],
  "tamil nadu": [
    "chennai",
    "coimbatore",
    "madurai",
    "salem",
    "tiruchirappalli",
    "trichy"
  ],
  telangana: ["hyderabad", "warangal"],
  "uttar pradesh": [
    "noida",
    "lucknow",
    "kanpur",
    "agra",
    "varanasi",
    "ghaziabad",
    "meerut"
  ],
  uttarakhand: ["dehradun", "haridwar"],
  "west bengal": ["kolkata", "howrah", "durgapur"],
  delhi: ["delhi", "new delhi"],
  "jammu and kashmir": ["jammu", "srinagar"],
  puducherry: ["puducherry", "pondicherry"],
  chandigarh: ["chandigarh"]
};

const STATE_ALIASES = {
  ap: "andhra pradesh",
  mp: "madhya pradesh",
  up: "uttar pradesh",
  arunachal: "arunachal pradesh",
  himachal: "himachal pradesh",
  tamilnadu: "tamil nadu",
  orissa: "odisha",
  bengal: "west bengal",
  jammu: "jammu and kashmir",
  kashmir: "jammu and kashmir",
  newdelhi: "delhi",
  pondicherry: "puducherry"
};

/* --------------------------------------------------------------------------
   NORMALIZATION
-------------------------------------------------------------------------- */

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[â€“â€”]/g, "-")
    .replace(/[_/\\]+/g, " ")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSkill(value = "") {
  const key = normalize(value);
  return SKILL_ALIASES[key] || key;
}

/* --------------------------------------------------------------------------
   SKILL MATCHING
-------------------------------------------------------------------------- */

function skillExistsInText(skill, text) {
  if (!skill || !text) {
    return false;
  }

  const wanted = normalizeSkill(skill);
  const value = normalize(text);

  if (wanted === "c++") {
    return /(^|[^a-z0-9])c\+\+([^a-z0-9]|$)/i.test(value);
  }

  if (wanted === "c#") {
    return /(^|[^a-z0-9])c#([^a-z0-9]|$)/i.test(value);
  }

  if (wanted === ".net") {
    return (
      /(^|[^a-z0-9])\.net([^a-z0-9]|$)/i.test(value) ||
      /\bdotnet\b/i.test(value)
    );
  }

  if (wanted === "node.js") {
    return /\bnode(?:\.js|js)?\b/i.test(value);
  }

  if (wanted === "react") {
    return /\breact(?:\.js|js)?\b/i.test(value);
  }

  if (wanted === "angular") {
    return /\bangular(?:js)?\b/i.test(value);
  }

  if (wanted === "vue.js") {
    return /\bvue(?:\.js|js)?\b/i.test(value);
  }

  if (wanted === "next.js") {
    return /\bnext(?:\.js|js)?\b/i.test(value);
  }

  if (wanted === "google cloud") {
    return (
      /\bgoogle cloud\b/i.test(value) ||
      /\bgcp\b/i.test(value)
    );
  }

  if (wanted === "machine learning") {
    return (
      /\bmachine learning\b/i.test(value) ||
      /\bml\b/i.test(value)
    );
  }

  if (wanted === "artificial intelligence") {
    return (
      /\bartificial intelligence\b/i.test(value) ||
      /\bai\b/i.test(value)
    );
  }

  if (wanted === "cybersecurity") {
    return (
      /\bcybersecurity\b/i.test(value) ||
      /\bcyber security\b/i.test(value)
    );
  }

  const escaped = wanted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return new RegExp(
    `(^|[^a-z0-9+#.])${escaped}($|[^a-z0-9+#.])`,
    "i"
  ).test(value);
}

/* --------------------------------------------------------------------------
   USER SKILLS
-------------------------------------------------------------------------- */

function parseSkills(value = "") {
  return [
    ...new Set(
      String(value)
        .split(",")
        .map(normalizeSkill)
        .filter(Boolean)
    )
  ];
}

/* --------------------------------------------------------------------------
   STORED JOB SKILLS
   IMPORTANT:
   ONLY MongoDB job.skills is used.
   Nothing is extracted from title, role or description.
-------------------------------------------------------------------------- */

function getStoredJobSkills(job) {
  if (!Array.isArray(job.skills)) {
    return [];
  }

  return [
    ...new Set(
      job.skills
        .map((skill) => String(skill || "").trim())
        .filter(Boolean)
    )
  ];
}

/* --------------------------------------------------------------------------
   ROLE MATCHING
-------------------------------------------------------------------------- */

function roleScore(job, requestedRole) {
  const requested = normalize(requestedRole);

  if (
    !requested ||
    requested === "any" ||
    requested === "any role"
  ) {
    return {
      score: 0,
      matched: []
    };
  }

  const title = normalize(job.title || "");
  const storedRole = normalize(job.role || "");
  const text = `${title} ${storedRole}`;

  const matched = [];

  if (title === requested) {
    return {
      score: 100,
      matched: [requested]
    };
  }

  if (title.includes(requested)) {
    return {
      score: 92,
      matched: [requested]
    };
  }

  const requestedWords = requested
    .split(" ")
    .filter((word) => word.length >= 3);

  let score = 0;

  for (const word of requestedWords) {
    if (text.includes(word)) {
      score += 12;
      matched.push(word);
    }
  }

  const roleFamilies = [
    [
      "software",
      ["software", "developer", "engineer", "programmer"]
    ],
    [
      "frontend",
      ["frontend", "front end", "ui", "react"]
    ],
    [
      "backend",
      ["backend", "back end", "api", "server"]
    ],
    [
      "full stack",
      ["full stack", "fullstack"]
    ],
    [
      "data",
      ["data", "analytics", "analyst"]
    ],
    [
      "cloud",
      ["cloud"]
    ],
    [
      "devops",
      ["devops", "sre", "platform"]
    ],
    [
      "security",
      ["security", "cyber"]
    ],
    [
      "testing",
      ["test", "qa", "quality"]
    ]
  ];

  for (const [family, words] of roleFamilies) {
    const requestedFamily = words.some((word) =>
      requested.includes(word)
    );

    const jobFamily = words.some((word) =>
      text.includes(word)
    );

    if (requestedFamily && jobFamily) {
      score += 25;
      matched.push(family);
    }
  }

  return {
    score: Math.min(100, score),
    matched: [...new Set(matched)]
  };
}

/* --------------------------------------------------------------------------
   STATE
-------------------------------------------------------------------------- */

function normalizeState(value = "") {
  const normalized = normalize(value);

  return STATE_ALIASES[normalized] || normalized;
}

function getStateFromLocation(location = "") {
  const value = normalize(location);

  for (const [state, cities] of Object.entries(
    INDIA_STATE_LOCATIONS
  )) {
    if (value.includes(state)) {
      return state;
    }

    if (
      cities.some((city) =>
        value.includes(normalize(city))
      )
    ) {
      return state;
    }
  }

  return null;
}

/* --------------------------------------------------------------------------
   LOCATION MATCHING
-------------------------------------------------------------------------- */

function locationMatch(jobLocation, requestedLocation) {
  const actual = normalize(jobLocation);
  const requested = normalize(requestedLocation);

  if (!requested) {
    return {
      matched: true,
      score: 0,
      type: "none",
      state: getStateFromLocation(actual)
    };
  }

  if (
    requested === "india" ||
    requested === "pan india" ||
    requested === "all india"
  ) {
    return {
      matched: true,
      score: 15,
      type: "india",
      state: null
    };
  }

  if (
    actual === requested ||
    actual.includes(requested)
  ) {
    return {
      matched: true,
      score: 40,
      type: "exact",
      state: getStateFromLocation(actual)
    };
  }

  const requestedState = normalizeState(requested);
  const cities = INDIA_STATE_LOCATIONS[requestedState];

  if (cities) {
    if (
      cities.some((city) =>
        actual.includes(normalize(city))
      )
    ) {
      return {
        matched: true,
        score: 30,
        type: "state",
        state: requestedState
      };
    }

    if (actual.includes(requestedState)) {
      return {
        matched: true,
        score: 30,
        type: "state",
        state: requestedState
      };
    }
  }

  const actualState = getStateFromLocation(actual);

  if (
    actualState &&
    actualState === requestedState
  ) {
    return {
      matched: true,
      score: 30,
      type: "state",
      state: actualState
    };
  }

  const requestedWords = requested
    .split(" ")
    .filter((word) => word.length >= 3);

  if (requestedWords.length) {
    const matches = requestedWords.filter((word) =>
      actual.includes(word)
    );

    if (
      matches.length === requestedWords.length
    ) {
      return {
        matched: true,
        score: 25,
        type: "partial",
        state: actualState
      };
    }
  }

  return {
    matched: false,
    score: 0,
    type: "none",
    state: actualState
  };
}

/* --------------------------------------------------------------------------
   DESCRIPTION CLEANUP
-------------------------------------------------------------------------- */

function cleanDescription(value = "") {
  return String(value || "")
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* --------------------------------------------------------------------------
   DEMO JOBS
-------------------------------------------------------------------------- */

const addDemoJobs = async (req, res) => {
  return res.status(410).json({
    status: false,
    message:
      "Demo jobs are disabled. JobFinder uses official company career jobs only."
  });
};

/* --------------------------------------------------------------------------
   FILTER DATA
   GET /api/job/filters

   Returns ONLY the 15 most relevant skills actually stored
   in active jobs.
-------------------------------------------------------------------------- */

const getJobFilters = async (req, res) => {
  try {
    const jobs = await Job.find({
      isActive: true,
      sourceType: "official_company_careers"
    })
      .select("skills location company")
      .lean();

    const skillCounts = new Map();
    const locations = new Set();
    const states = new Set();
    const companies = new Set();

    for (const job of jobs) {
      if (job.company) {
        companies.add(String(job.company).trim());
      }

      if (job.location) {
        const location = String(job.location).trim();

        if (location) {
          locations.add(location);

          const state = getStateFromLocation(location);

          if (state) {
            states.add(state);
          }
        }
      }

      const storedSkills = getStoredJobSkills(job);

      for (const skill of storedSkills) {
        const key = normalizeSkill(skill);

        if (!key) {
          continue;
        }

        skillCounts.set(
          key,
          (skillCounts.get(key) || 0) + 1
        );
      }
    }

    const finalSkills = [...skillCounts.entries()]
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }

        return a[0].localeCompare(a[0]);
      })
      .slice(0, 15)
      .map(([skill]) => skill);

    const finalLocations = [...locations]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    const finalStates = [...states]
      .sort((a, b) => a.localeCompare(b));

    const finalCompanies = [...companies]
      .sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      status: true,
      totalActiveJobs: jobs.length,

      totalSkills: finalSkills.length,

      totalLocations: finalLocations.length,

      totalStates: finalStates.length,

      totalCompanies: finalCompanies.length,

      skills: finalSkills,

      locations: finalLocations,

      states: finalStates,

      companies: finalCompanies
    });
  } catch (error) {
    console.error(
      "Get job filters error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to load job filters.",
      error: error.message
    });
  }
};

/* --------------------------------------------------------------------------
   MATCH JOBS
-------------------------------------------------------------------------- */

const matchJobs = async (req, res) => {
  try {
    const requestedRole = String(
      req.query.role || ""
    ).trim();

    const requestedSkills = parseSkills(
      req.query.skills || ""
    );

    const requestedState = String(
      req.query.state || ""
    ).trim();

    const requestedLocation = String(
      req.query.location || ""
    ).trim();

    const finalLocation =
      requestedState || requestedLocation;

    const jobs = await Job.find({
      isActive: true,
      sourceType: "official_company_careers"
    }).lean();

    const results = [];

    for (const job of jobs) {
      /* ----------------------------------------------------------------------
         ONLY STORED SKILLS
      ---------------------------------------------------------------------- */

      const storedJobSkills =
        getStoredJobSkills(job);

      /* ----------------------------------------------------------------------
         SKILL MATCH
      ---------------------------------------------------------------------- */

      const matchedSkills =
        requestedSkills.filter(
          (requestedSkill) =>
            storedJobSkills.some(
              (storedSkill) =>
                normalizeSkill(storedSkill) ===
                normalizeSkill(requestedSkill)
            )
        );

      if (
        requestedSkills.length > 0 &&
        matchedSkills.length === 0
      ) {
        continue;
      }

      const skillPercentage =
        requestedSkills.length
          ? Math.round(
              (matchedSkills.length /
                requestedSkills.length) *
                100
            )
          : 0;

      /* ----------------------------------------------------------------------
         ROLE MATCH
      ---------------------------------------------------------------------- */

      const role = roleScore(
        job,
        requestedRole
      );

      const hasRole =
        requestedRole &&
        !["any", "any role"].includes(
          normalize(requestedRole)
        );

      if (
        hasRole &&
        role.score < 15
      ) {
        continue;
      }

      /* ----------------------------------------------------------------------
         LOCATION
      ---------------------------------------------------------------------- */

      const location = locationMatch(
        job.location,
        finalLocation
      );

      if (
        finalLocation &&
        !location.matched
      ) {
        continue;
      }

      /* ----------------------------------------------------------------------
         FINAL SCORE

         Role     = 55
         Skills   = 30
         Location = 15
      ---------------------------------------------------------------------- */

      let score = 0;

      if (hasRole) {
        score += Math.round(
          (role.score / 100) * 55
        );
      }

      if (requestedSkills.length) {
        score += Math.round(
          (skillPercentage / 100) * 30
        );
      } else if (!hasRole) {
        score += 70;
      }

      if (finalLocation) {
        score += Math.round(
          (location.score / 40) * 15
        );
      }

      if (matchedSkills.length >= 2) {
        score += 3;
      }

      if (matchedSkills.length >= 4) {
        score += 2;
      }

      score = Math.min(
        100,
        Math.max(0, score)
      );

      results.push({
        ...job,

        description:
          cleanDescription(
            job.description
          ),

        skills: storedJobSkills,

        matchedSkills,

        skillMatchCount:
          matchedSkills.length,

        skillMatchPercentage:
          skillPercentage,

        matchedRoleTerms:
          role.matched,

        roleMatchScore:
          role.score,

        locationMatched:
          location.matched,

        locationMatchType:
          location.type,

        locationScore:
          location.score,

        detectedJobState:
          location.state,

        selectedState:
          requestedState
            ? normalizeState(
                requestedState
              )
            : null,

        matchScore: score
      });
    }

    /* ----------------------------------------------------------------------
       BEST JOBS FIRST
    ---------------------------------------------------------------------- */

    results.sort((a, b) => {
      if (
        b.skillMatchPercentage !==
        a.skillMatchPercentage
      ) {
        return (
          b.skillMatchPercentage -
          a.skillMatchPercentage
        );
      }

      if (
        b.matchScore !==
        a.matchScore
      ) {
        return (
          b.matchScore -
          a.matchScore
        );
      }

      if (
        b.roleMatchScore !==
        a.roleMatchScore
      ) {
        return (
          b.roleMatchScore -
          a.roleMatchScore
        );
      }

      return (
        new Date(
          b.lastSeenAt || 0
        ) -
        new Date(
          a.lastSeenAt || 0
        )
      );
    });

    return res.status(200).json({
      status: true,

      count: results.length,

      sourcePolicy:
        "official company career pages only",

      filters: {
        role:
          requestedRole || null,

        skills:
          requestedSkills,

        state:
          requestedState
            ? normalizeState(
                requestedState
              )
            : null,

        location:
          requestedLocation || null
      },

      jobs: results
    });
  } catch (error) {
    console.error(
      "Match jobs error:",
      error
    );

    return res.status(500).json({
      status: false,
      message:
        "Failed to find matching jobs.",
      error: error.message
    });
  }
};

export {
  addDemoJobs,
  matchJobs,
  getJobFilters
};
