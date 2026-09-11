import { Job } from "../models/job.model.js";

const SKILL_ALIASES = {
  js: "javascript", javascript: "javascript", ts: "typescript", typescript: "typescript",
  reactjs: "react", react: "react", node: "node.js", nodejs: "node.js", "node.js": "node.js",
  cpp: "c++", "c++": "c++", csharp: "c#", "c#": "c#", python: "python", java: "java",
  sql: "sql", mongodb: "mongodb", mongo: "mongodb", postgres: "postgresql", postgresql: "postgresql",
  mysql: "mysql", aws: "aws", azure: "azure", gcp: "google cloud", "google cloud": "google cloud",
  docker: "docker", kubernetes: "kubernetes", git: "git", github: "github", html: "html", css: "css",
  angular: "angular", vue: "vue.js", "vue.js": "vue.js", next: "next.js", "next.js": "next.js",
  spring: "spring", "spring boot": "spring boot", django: "django", flask: "flask", fastapi: "fastapi",
  tensorflow: "tensorflow", pytorch: "pytorch", "machine learning": "machine learning",
  ml: "machine learning", "artificial intelligence": "artificial intelligence", ai: "artificial intelligence",
  terraform: "terraform", jenkins: "jenkins", kafka: "kafka", spark: "spark", rust: "rust",
  go: "go", golang: "go", ruby: "ruby", php: "php", kotlin: "kotlin", swift: "swift", scala: "scala",
  dart: "dart", flutter: "flutter", "c language": "c", c: "c", ".net": ".net", dotnet: ".net",
  selenium: "selenium", cypress: "cypress", playwright: "playwright", serviceNow: "servicenow",
  servicenow: "servicenow", sap: "sap", "sap abap": "sap abap", oracle: "oracle", salesforce: "salesforce",
  tableau: "tableau", "power bi": "power bi", linux: "linux", unix: "unix", bash: "bash",
  powershell: "powershell", redis: "redis", cassandra: "cassandra", snowflake: "snowflake",
  databricks: "databricks", hadoop: "hadoop", airflow: "airflow", etl: "etl", graphql: "graphql",
  grpc: "grpc", rest: "rest", "rest api": "rest api", microservices: "microservices", devops: "devops",
  devsecops: "devsecops", sre: "sre", cybersecurity: "cybersecurity", "information security": "information security",
  android: "android", ios: "ios", "react native": "react native", "objective-c": "objective-c",
  "test automation": "test automation", "api testing": "api testing", "data science": "data science",
  "data engineering": "data engineering", llm: "llm", nlp: "nlp", "generative ai": "generative ai",
};

const TECH_TERMS = Object.values(SKILL_ALIASES).filter((value, index, arr) => arr.indexOf(value) === index);

const ROLE_GROUPS = [
  ["full stack", ["full stack", "fullstack"]],
  ["frontend", ["frontend", "front end", "ui developer", "ui engineer"]],
  ["backend", ["backend", "back end", "api developer", "server developer"]],
  ["devops", ["devops", "dev sec ops", "site reliability", "sre", "platform engineer"]],
  ["cloud", ["cloud engineer", "cloud developer", "cloud architect", "cloud consultant"]],
  ["data engineer", ["data engineer", "data engineering"]],
  ["data scientist", ["data scientist", "data science"]],
  ["machine learning", ["machine learning", "ml engineer", "ml developer"]],
  ["ai", ["ai engineer", "ai developer", "artificial intelligence", "genai", "generative ai"]],
  ["security", ["security engineer", "cybersecurity", "cyber security", "application security", "information security"]],
  ["qa", ["qa", "quality assurance", "test engineer", "test automation", "automation testing", "sdet"]],
  ["mobile", ["mobile developer", "mobile engineer", "mobile development"]],
  ["android", ["android developer", "android engineer"]],
  ["ios", ["ios developer", "ios engineer"]],
  ["embedded", ["embedded engineer", "embedded developer", "firmware engineer"]],
  ["database", ["database developer", "database engineer", "database administrator", "dba"]],
  ["network", ["network engineer", "network administrator", "network security"]],
  ["software", ["software developer", "software engineer", "software development", "software engineering", "programmer"]],
];

const STRONG_ROLE_WORDS = [
  "developer", "engineer", "programmer", "architect", "scientist", "administrator", "analyst",
  "tester", "consultant", "specialist", "lead", "technical", "technology", "devops", "sre",
  "designer", "support", "database", "network", "security", "qa", "sdet",
];

const STRONG_NON_TECH_TITLE_WORDS = [
  "sales", "marketing", "recruiter", "recruitment", "human resources", "finance", "legal",
  "account manager", "client partner", "business development", "customer service representative",
  "procurement", "payroll", "administrative assistant",
];

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/&/g, " and ")
    .replace(/[_/|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSkill(value = "") {
  const key = normalize(value);
  return SKILL_ALIASES[key] || key;
}

function skillRegex(skill) {
  const escaped = normalizeSkill(skill).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9+#.])${escaped}($|[^a-z0-9+#.])`, "i");
}

function skillExistsInText(skill, text) {
  if (!skill || !text) return false;
  const normalized = normalizeSkill(skill);
  const value = normalize(text);

  if (normalized === "c++") return /(^|[^a-z0-9])c\+\+([^a-z0-9]|$)/i.test(value);
  if (normalized === "c#") return /(^|[^a-z0-9])c#([^a-z0-9]|$)/i.test(value);
  if (normalized === ".net") return /(^|[^a-z0-9])\.net([^a-z0-9]|$)|\bdotnet\b/i.test(value);
  if (normalized === "node.js") return /\bnode(?:\.js|js)?\b/i.test(value);
  if (normalized === "next.js") return /\bnext(?:\.js|js)?\b/i.test(value);
  if (normalized === "vue.js") return /\bvue(?:\.js|js)?\b/i.test(value);
  if (normalized === "google cloud") return /google\s+cloud|\bgcp\b/i.test(value);
  if (normalized === "machine learning") return /machine\s+learning|\bml\b/i.test(value);
  if (normalized === "artificial intelligence") return /artificial\s+intelligence|\bai\b/i.test(value);
  if (normalized === "c") return /(^|[^a-z0-9+#])c([^a-z0-9+#]|$)/i.test(value);
  if (normalized === "go") return /(^|[^a-z0-9+#])go([^a-z0-9+#]|$)/i.test(value);

  return skillRegex(normalized).test(value);
}

function parseSkills(value = "") {
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeSkill)
    .filter((item, index, array) => array.indexOf(item) === index);
}

function extractRoleGroups(role) {
  const value = normalize(role);
  return ROLE_GROUPS.filter(([, phrases]) => phrases.some((phrase) => value.includes(phrase))).map(([name]) => name);
}

function extractTechTerms(role) {
  const value = normalize(role);
  return TECH_TERMS.filter((term) => skillExistsInText(term, value));
}

function meaningfulRoleTokens(role) {
  const stop = new Set(["a", "an", "the", "and", "or", "for", "with", "in", "on", "of", "to", "at", "any"]);
  return normalize(role)
    .split(" ")
    .filter((token) => token.length > 1 && !stop.has(token));
}

function titleIsStronglyNonTechnical(title) {
  const value = normalize(title);
  return STRONG_NON_TECH_TITLE_WORDS.some((word) => value.includes(word));
}

function roleMatch(job, requestedRole) {
  const requested = normalize(requestedRole);
  if (!requested || requested === "any role" || requested === "any") {
    return { score: 0, matchedRoleTerms: [] };
  }

  const title = normalize(job.title || "");
  const storedRole = normalize(job.role || "");
  const skills = Array.isArray(job.skills) ? job.skills : [];
  const skillText = normalize(skills.join(" "));
  const roleText = `${title} ${storedRole}`;
  const combined = `${roleText} ${skillText}`;
  const groups = extractRoleGroups(requested);
  const techTerms = extractTechTerms(requested);
  const tokens = meaningfulRoleTokens(requested);
  const matchedRoleTerms = [];

  if (title === requested || title.includes(requested)) {
    return { score: 70, matchedRoleTerms: [requested] };
  }

  let score = 0;

  for (const term of tokens) {
    if (term.length >= 3 && roleText.includes(term)) {
      score += 10;
      matchedRoleTerms.push(term);
    }
  }

  for (const tech of techTerms) {
    if (skillExistsInText(tech, combined)) {
      score += 18;
      matchedRoleTerms.push(tech);
    }
  }

  for (const group of groups) {
    const definition = ROLE_GROUPS.find(([name]) => name === group)?.[1] || [];
    if (definition.some((phrase) => roleText.includes(normalize(phrase)))) {
      score += 28;
      matchedRoleTerms.push(group);
    } else if (group === "software" && /software|developer|engineer|programmer|technology consultant|technology analyst/.test(roleText)) {
      score += 22;
      matchedRoleTerms.push(group);
    } else if (group === "frontend" && (skillExistsInText("react", combined) || skillExistsInText("javascript", combined) || /ui|front end|frontend/.test(roleText))) {
      score += 18;
      matchedRoleTerms.push(group);
    } else if (group === "backend" && (skillExistsInText("node.js", combined) || skillExistsInText("java", combined) || /api|backend|back end|server/.test(roleText))) {
      score += 18;
      matchedRoleTerms.push(group);
    }
  }

  const requestedNeedsTechnicalRole = STRONG_ROLE_WORDS.some((word) => requested.includes(word));
  const jobLooksLikeTechnicalRole = STRONG_ROLE_WORDS.some((word) => roleText.includes(word));

  if (requestedNeedsTechnicalRole && !jobLooksLikeTechnicalRole) {
    score -= 35;
  }

  if (titleIsStronglyNonTechnical(title) && requestedNeedsTechnicalRole && !title.includes("technical")) {
    score = Math.min(score, 10);
  }

  if (techTerms.length > 0 && techTerms.every((term) => !skillExistsInText(term, combined))) {
    return { score: 0, matchedRoleTerms: [] };
  }

  score = Math.max(0, Math.min(70, score));
  return { score, matchedRoleTerms: [...new Set(matchedRoleTerms)] };
}

function locationScore(jobLocation = "", requestedLocation = "") {
  const requested = normalize(requestedLocation);
  const actual = normalize(jobLocation);
  if (!requested || !actual) return 0;
  if (actual.includes(requested)) return 15;

  const parts = requested.split(" ").filter((part) => part.length >= 3);
  const matches = parts.filter((part) => actual.includes(part));
  if (matches.length === parts.length && parts.length) return 12;
  if (matches.length > 0) return 7;
  return 0;
}

function cleanDescriptionForResponse(value = "") {
  let text = String(value || "");
  for (let i = 0; i < 3; i += 1) {
    const decoded = text
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&nbsp;/gi, " ");
    if (decoded === text) break;
    text = decoded;
  }
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>(\r?\n)?/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const addDemoJobs = async (req, res) => {
  return res.status(410).json({
    status: false,
    message: "Demo jobs are disabled. JobFinder uses official company career jobs only.",
  });
};

const matchJobs = async (req, res) => {
  try {
    const requestedSkills = parseSkills(req.query.skills || "");
    const requestedRole = String(req.query.role || "").trim();
    const requestedLocation = String(req.query.location || "").trim();

    const jobs = await Job.find({
      isActive: true,
      sourceType: "official_company_careers",
    }).lean();

    const results = [];

    for (const job of jobs) {
      const storedSkills = Array.isArray(job.skills) ? job.skills : [];
      const matchText = `${job.title || ""} ${job.role || ""} ${storedSkills.join(" ")}`;
      const matchedSkills = requestedSkills.filter((skill) => skillExistsInText(skill, matchText));

      if (requestedSkills.length && matchedSkills.length === 0) continue;

      const role = roleMatch(job, requestedRole);
      if (requestedRole && !["any role", "any"].includes(normalize(requestedRole)) && role.score < 15) continue;

      const locScore = locationScore(job.location, requestedLocation);

      let score = 0;
      if (requestedRole && !["any role", "any"].includes(normalize(requestedRole))) {
        score += Math.round((role.score / 70) * 60);
      } else if (requestedSkills.length) {
        score += Math.round((matchedSkills.length / requestedSkills.length) * 85);
      } else {
        score += 70;
      }

      if (requestedSkills.length && requestedRole && !["any role", "any"].includes(normalize(requestedRole))) {
        score += Math.round((matchedSkills.length / requestedSkills.length) * 25);
      }

      score += locScore;
      score = Math.min(100, score);

      results.push({
        ...job,
        description: cleanDescriptionForResponse(job.description),
        skills: storedSkills,
        matchedSkills,
        matchedRoleTerms: role.matchedRoleTerms,
        locationMatched: locScore > 0,
        matchScore: score,
      });
    }

    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (Boolean(b.locationMatched) !== Boolean(a.locationMatched)) return b.locationMatched ? 1 : -1;
      return new Date(b.lastSeenAt || 0) - new Date(a.lastSeenAt || 0);
    });

    return res.status(200).json({
      status: true,
      count: results.length,
      sourcePolicy: "official company career pages only",
      jobs: results,
    });
  } catch (error) {
    console.error("Match jobs error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to find matching jobs.",
      error: error.message,
    });
  }
};

export { addDemoJobs, matchJobs };
