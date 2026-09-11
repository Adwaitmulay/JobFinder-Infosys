import axios from "axios";
import https from "https";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://digitalcareers.infosys.com/infosys/global-careers";
const DETAIL_BASE = "https://digitalcareers.infosys.com/global-careers/company-job/description/reqid/";
const OUTPUT = path.join(__dirname, "..", "infosys-real-jobs.json");
const PER_PAGE = 100;
const CONCURRENCY = 6;
const DELAY_MS = 180;

const insecureAgent = process.env.ALLOW_INSECURE_TLS === "true"
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

const client = axios.create({
  timeout: 30000,
  headers: {
    "User-Agent": "JobFinder/1.0 (official careers collector)",
    Accept: "text/html,application/xhtml+xml",
  },
  httpsAgent: insecureAgent,
});

const TECH_TITLE_WORDS = [
  "software", "developer", "development", "engineer", "engineering", "programmer",
  "programming", "technology", "technical", "it ", "information technology", "application",
  "applications", "backend", "back-end", "frontend", "front-end", "full stack", "full-stack",
  "web", "mobile", "android", "ios", "data", "database", "devops", "cloud", "security",
  "cyber", "network", "infrastructure", "platform", "systems", "system", "qa", "quality",
  "test automation", "testing", "sdet", "machine learning", "ml", "artificial intelligence",
  "ai/ml", "ai engineer", "architect", "architecture", "sap", "oracle", "salesforce",
  "servicenow", "peoplesoft", "mainframe", "embedded", "firmware", "api", "microservices",
  "site reliability", "sre", "ux", "ui", "automation", "devsecops", "release", "integration",
  "technical consultant", "technology consultant", "technology lead", "technology analyst",
];

const NON_TECH_TITLE_WORDS = [
  "sales", "account manager", "business development", "recruiter", "recruitment", "human resources",
  "hr manager", "finance", "financial analyst", "legal", "marketing", "customer service representative",
  "client partner", "commercial", "procurement", "purchasing", "payroll", "administrative assistant",
];

const SKILLS = [
  "C++", "C#", "JavaScript", "TypeScript", "Python", "Java", "Go", "Golang", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "Scala", "R", "MATLAB", "Perl", "COBOL", "ABAP", "PL/SQL", "SQL",
  "HTML", "CSS", "React", "React.js", "Angular", "Vue", "Vue.js", "Next.js", "Svelte", "Redux", "Bootstrap", "jQuery", "Tailwind CSS",
  "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring", "Spring Boot", ".NET", "ASP.NET", "Laravel", "Microservices", "REST", "REST API", "GraphQL", "gRPC",
  "MySQL", "PostgreSQL", "Oracle", "SQL Server", "MongoDB", "Redis", "Cassandra", "DynamoDB", "DB2", "Sybase", "Snowflake", "Databricks", "Spark", "Hadoop", "Kafka", "Airflow", "ETL",
  "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub", "GitLab", "Git", "CI/CD", "Linux", "Unix", "Shell", "Bash", "PowerShell", "Ansible", "Helm", "DevOps", "DevSecOps", "SRE",
  "Machine Learning", "Artificial Intelligence", "Generative AI", "LLM", "NLP", "TensorFlow", "PyTorch", "Data Science", "Data Engineering", "Computer Vision",
  "Android", "iOS", "Flutter", "Swift", "Kotlin", "Objective-C", "React Native",
  "Selenium", "Cypress", "Playwright", "JUnit", "PyTest", "Test Automation", "Automation Testing", "API Testing",
  "ServiceNow", "Salesforce", "SAP", "SAP ABAP", "SAP HANA", "SAP MM", "SAP SD", "SAP FICO", "Oracle Cloud", "Oracle Fusion", "Power BI", "Tableau", "Informatica", "Dynamics 365",
  "Cybersecurity", "Information Security", "Application Security", "IAM", "Network Security", "Cloud Security", "Zero Trust",
  "UI/UX", "UX", "UI", "Figma", "User Experience",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(value = "") {
  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDescription(value = "") {
  if (!value) return "";
  const $ = cheerio.load(String(value), { decodeEntities: true });
  $("script,style,noscript,svg,template").remove();
  $("br").replaceWith("\n");
  $("p,div,section,article,li,h1,h2,h3,h4,h5,h6").each((_, el) => {
    $(el).prepend("\n");
    $(el).append("\n");
  });
  return $.root().text()
    .split("\n")
    .map((line) => cleanText(line))
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeUrl(href) {
  if (!href) return "";
  if (href.startsWith("http")) return href.split("?")[0];
  return new URL(href, "https://digitalcareers.infosys.com").href.split("?")[0];
}

function isTechnicalCandidate(text) {
  const value = cleanText(text).toLowerCase();
  const positive = TECH_TITLE_WORDS.some((word) => value.includes(word));
  if (!positive) return false;

  const strongNonTech = NON_TECH_TITLE_WORDS.some((word) => value.includes(word));
  if (strongNonTech && !/(technology|technical|software|developer|engineer|devops|cloud|data|security|sap|oracle|servicenow|automation|testing|infrastructure)/i.test(value)) {
    return false;
  }
  return true;
}

function extractReqId(url) {
  const match = String(url).match(/reqid\/([^/?#]+)/i);
  return match ? match[1] : "";
}

function extractSkills(text) {
  const source = cleanText(text);
  const found = new Set();

  for (const skill of SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-z0-9+#])${escaped}([^a-z0-9+#]|$)`, "i");
    if (pattern.test(source)) found.add(skill);
  }

  return [...found];
}

function extractLabeledValue(text, label, nextLabels = []) {
  const lines = String(text).split("\n").map(cleanText).filter(Boolean);
  const index = lines.findIndex((line) => line.toLowerCase() === label.toLowerCase());
  if (index === -1) return "";

  const value = lines[index + 1] || "";
  if (nextLabels.some((next) => value.toLowerCase() === next.toLowerCase())) return "";
  return value;
}

function extractJobType(text, title) {
  const value = `${title} ${text}`.toLowerCase();
  if (/intern|internship|graduate trainee|trainee/.test(value)) return "Internship";
  if (/part[ -]?time/.test(value)) return "Part Time";
  if (/contract|contractor/.test(value)) return "Contract";
  return "Full Time";
}

function parseDetail(html, url, listingText = "") {
  const $ = cheerio.load(html, { decodeEntities: true });
  $("script,style,noscript,svg,template").remove();

  const bodyText = $.root().text();
  const lines = bodyText.split("\n").map(cleanText).filter(Boolean);

  let title = cleanText($("h1").first().text());
  if (!title) {
    title = lines[0] || cleanText(listingText).split(/\s+\d{5,6}BR\b/i)[0];
  }

  const workLocation = extractLabeledValue(bodyText, "Work Location", ["State / Region / Province", "Country"]);
  const country = extractLabeledValue(bodyText, "Country", ["Domain", "Interest Group"]);
  const companyField = extractLabeledValue(bodyText, "Company", ["Requisition ID"]);
  const careerRole = extractLabeledValue(bodyText, "Career Role", ["Work Location", "State / Region / Province"]);
  const jobRole = extractLabeledValue(bodyText, "Job Role", ["Career Role", "Work Location"]);
  const reqId = extractLabeledValue(bodyText, "Requisition ID", ["Technical Skills 1", "Overview"]);

  const technicalSkills = [];
  for (const line of lines) {
    if (/^Technical Skills \d+$/i.test(line)) {
      const next = lines[lines.indexOf(line) + 1];
      if (next) technicalSkills.push(next);
    }
  }

  const overviewIndex = lines.findIndex((line) => line.toLowerCase() === "overview");
  const description = overviewIndex >= 0 ? lines.slice(overviewIndex).join("\n") : cleanDescription($.root().html());

  const skillText = `${technicalSkills.join(" ")} ${description} ${jobRole} ${careerRole} ${title}`;
  const skills = [...new Set([...technicalSkills.flatMap((x) => extractSkills(x)), ...extractSkills(skillText)])];

  return {
    title: title || "Infosys Technology Opportunity",
    company: "Infosys",
    skills,
    location: cleanText(workLocation || country || "Not specified"),
    jobType: extractJobType(bodyText, title),
    description: cleanText(description),
    jobUrl: url,
    role: cleanText(careerRole || jobRole || title),
    source: "Infosys Careers",
    sourceType: "official_company_careers",
    sourcePage: BASE_URL,
    sourceJobId: cleanText(reqId || extractReqId(url)),
    publishedAt: null,
    isActive: true,
  };
}

async function fetchListingPage(page) {
  const url = `${BASE_URL}?page=${page}&per_page=${PER_PAGE}`;
  const response = await client.get(url);
  const $ = cheerio.load(response.data, { decodeEntities: true });
  const jobs = [];

  $("a[href*='/global-careers/company-job/description/reqid/']").each((_, el) => {
    const href = normalizeUrl($(el).attr("href"));
    const text = cleanText($(el).text());
    if (!href) return;
    jobs.push({ url: href, listingText: text });
  });

  const unique = new Map();
  for (const job of jobs) {
    if (isTechnicalCandidate(job.listingText)) unique.set(job.url, job);
  }

  return { jobs: [...unique.values()] };
}

async function getTotalJobs() {
  const response = await client.get(`${BASE_URL}?page=1&per_page=${PER_PAGE}`);
  const match = response.data.match(/Showing\s+1\s+to\s+\d+\s+of\s+(\d+)\s+matching jobs/i);
  return match ? Number(match[1]) : null;
}

async function fetchDetail(item) {
  try {
    const response = await client.get(item.url);
    return parseDetail(response.data, item.url, item.listingText);
  } catch (error) {
    console.log(`DETAIL FAILED ${item.url}: ${error.message}`);
    return null;
  }
}

async function runPool(items, worker, concurrency) {
  const results = [];
  let cursor = 0;

  async function runWorker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      const result = await worker(items[index], index);
      if (result) results.push(result);
      await sleep(DELAY_MS);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, runWorker));
  return results;
}

export async function scrapeInfosysJobs() {
  console.log("========================================");
  console.log("JOB FINDER - OFFICIAL INFOSYS CAREERS");
  console.log("========================================");
  console.log(`Source: ${BASE_URL}`);

  const total = await getTotalJobs();
  const pages = total ? Math.ceil(total / PER_PAGE) : 20;
  console.log(`Infosys listing count: ${total ?? "unknown"}`);
  console.log(`Listing pages to read: ${pages}`);

  const listingMap = new Map();

  for (let page = 1; page <= pages; page += 1) {
    try {
      const result = await fetchListingPage(page);
      for (const item of result.jobs) listingMap.set(item.url, item);
      console.log(`Page ${page}/${pages}: ${result.jobs.length} technical candidates`);
    } catch (error) {
      console.log(`LISTING PAGE ${page} FAILED: ${error.message}`);
    }
    await sleep(DELAY_MS);
  }

  const candidates = [...listingMap.values()];
  console.log(`Technical candidates before detail parsing: ${candidates.length}`);

  const details = await runPool(candidates, async (item, index) => {
    const job = await fetchDetail(item);
    if (job && isTechnicalCandidate(`${job.title} ${job.role} ${job.skills.join(" ")}`)) {
      if ((index + 1) % 25 === 0 || index === candidates.length - 1) {
        console.log(`Details processed: ${index + 1}/${candidates.length}`);
      }
      return job;
    }
    return null;
  }, CONCURRENCY);

  const unique = new Map();
  for (const job of details) {
    if (!job.jobUrl || unique.has(job.jobUrl)) continue;
    unique.set(job.jobUrl, job);
  }

  const jobs = [...unique.values()];
  fs.writeFileSync(OUTPUT, JSON.stringify(jobs, null, 2), "utf8");

  console.log("========================================");
  console.log(`Official Infosys IT/software jobs saved: ${jobs.length}`);
  console.log(`File: ${OUTPUT}`);
  console.log("========================================");

  return jobs;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  scrapeInfosysJobs().catch((error) => {
    console.error("Infosys scraper failed:", error);
    process.exit(1);
  });
}
