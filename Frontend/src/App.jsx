import React, { useEffect, useRef, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://jobfinder-infosys.onrender.com";

const ROLE_OPTIONS = [
  "Software Developer",
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Python Developer",
  "Java Developer",
  "Java Full Stack Developer",
  "React Developer",
  "Data Engineer",
  "Data Scientist",
  "AI Engineer",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Cybersecurity Engineer",
  "QA Automation Engineer",
  "SDET",
  "Android Developer",
  "iOS Developer",
  "Any Role",
];

const FALLBACK_SKILLS = [
  "finance and accounting",
  "java",
  "azure",
  "python",
  "aws",
  "oracle",
  "artificial intelligence",
  "spring boot",
  "servicenow",
  "microservices",
  ".net",
  "salesforce(sfdc)",
  "automation testing",
  "sap",
  "sql",
];

const FALLBACK_LOCATIONS = [
  "Ahmedabad",
  "Bengaluru",
  "Bhopal",
  "Chennai",
  "Coimbatore",
  "Delhi",
  "Hyderabad",
  "India",
  "Indore",
  "Kochi",
  "Kolkata",
  "Lucknow",
  "Mumbai",
  "Nagpur",
  "Nashik",
  "Patna",
  "Pune",
  "Visakhapatnam",
];

const decodeHtmlEntities = (value = "") => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

const cleanJobDescription = (value = "") => {
  if (!value) return "No description available.";

  let text = value;

  for (let i = 0; i < 3; i++) {
    const decoded = decodeHtmlEntities(text);
    if (decoded === text) break;
    text = decoded;
  }

  text = text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<li\b[^>]*>/gi, " • ")
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|ul|ol)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text || "No description available.";
};

function App() {
  const [name, setName] = useState("");
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState("Pune");
  const [role, setRole] = useState("Software Developer");
  const [company, setCompany] = useState("All Companies");

  const [availableSkills, setAvailableSkills] = useState(FALLBACK_SKILLS);
  const [availableLocations, setAvailableLocations] =
    useState(FALLBACK_LOCATIONS);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [skillsOpen, setSkillsOpen] = useState(false);

  const skillsRef = useRef(null);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setFiltersLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/job/filters`
        );

        if (!response.ok) {
          throw new Error(`Filters request failed: ${response.status}`);
        }

        const data = await response.json();

        if (data?.status) {
          if (Array.isArray(data.skills) && data.skills.length > 0) {
            setAvailableSkills(data.skills.slice(0, 15));
          }

          if (Array.isArray(data.locations) && data.locations.length > 0) {
            setAvailableLocations(data.locations);
          }
        }
      } catch (error) {
        console.error("Error loading job filters:", error);
      } finally {
        setFiltersLoading(false);
      }
    };

    loadFilters();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        skillsRef.current &&
        !skillsRef.current.contains(event.target)
      ) {
        setSkillsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const toggleSkill = (skill) => {
    setSkills((current) => {
      if (current.includes(skill)) {
        return current.filter((item) => item !== skill);
      }

      return [...current, skill];
    });
  };

  const findJobs = async () => {
    try {
      setLoading(true);
      setSearched(false);
      setSkillsOpen(false);

      const skillQuery = skills.join(",");

      const response = await fetch(
        `${API_BASE_URL}/api/public-job/match?company=${encodeURIComponent(company)}&role=${encodeURIComponent(
          role
        )}&skills=${encodeURIComponent(
          skillQuery
        )}&location=${encodeURIComponent(location)}`
      );

      const data = await response.json();

      if (data?.status) {
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      } else {
        setJobs([]);
      }

      setSearched(true);
    } catch (error) {
      console.error("Error finding jobs:", error);
      setJobs([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const selectedSkillsText =
    skills.length === 0
      ? "Select relevant skills"
      : skills.length === 1
      ? skills[0]
      : `${skills.length} skills selected`;

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <div className="logo-icon">J</div>
            <span>JobFinder</span>
          </div>

          <div className="nav-links">
            <a href="#jobs">Find Jobs</a>
            <a href="#profile">Create Profile</a>
            <button
              className="nav-button"
              onClick={() =>
                document
                  .getElementById("profile")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>✦</span>
            Smart job matching for freshers
          </div>

          <h1>
            Find a job that
            <br />
            <span>matches you.</span>
          </h1>

          <p>
            Create your profile, add your skills and discover
            job opportunities that match your role and location.
          </p>

          <div className="hero-stats">
            <div>
              <strong>3</strong>
              <span>Companies</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>Skill Based</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Job Updates</span>
            </div>
          </div>
        </div>

        <div className="hero-decoration">
          <div className="floating-card card-one">
            <span>✓</span>
            Skills matched
          </div>

          <div className="floating-card card-two">
            <span>●</span>
            New opportunity
          </div>

          <div className="hero-circle">
            <div className="hero-circle-inner">
              <span>J</span>
            </div>
          </div>
        </div>
      </section>

      <section className="profile-section" id="profile">
        <div className="section-heading">
          <div>
            <span className="section-label">YOUR PROFILE</span>
            <h2>Tell us about yourself</h2>
            <p>
              We'll use these details to find relevant opportunities for you.
            </p>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-top">
            <div className="profile-icon">👤</div>

            <div>
              <h3>Create Your Job Profile</h3>
              <p>
                No account required. Just enter your details and find jobs.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adwait Mulay"
              />
            </div>

            <div className="form-group">
              <label>Preferred Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={filtersLoading}
              >
                {availableLocations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" ref={skillsRef}>
              <label>Your Skills</label>

              <button
                type="button"
                className={`custom-select ${
                  skillsOpen ? "custom-select-open" : ""
                }`}
                onClick={() => setSkillsOpen((value) => !value)}
                disabled={filtersLoading}
              >
                <span className={skills.length ? "selected-value" : "placeholder-value"}>
                  {filtersLoading ? "Loading skills..." : selectedSkillsText}
                </span>
                <span className="select-arrow">▼</span>
              </button>

              {skillsOpen && (
                <div className="skills-dropdown">
                  <div className="skills-dropdown-header">
                    <span>Relevant skills</span>
                    {skills.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSkills([])}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {availableSkills.map((skill) => (
                    <label
                      className="skill-option"
                      key={skill}
                    >
                      <input
                        type="checkbox"
                        checked={skills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              )}

              <small>
                Select one or more relevant skills
              </small>
            </div>

            <div className="form-group">
              <label>Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              >
                <option value="All Companies">All Companies</option>
                <option value="Infosys">Infosys</option>
                <option value="TCS">TCS</option>
                <option value="Wipro">Wipro</option>
              </select>
              <small>Select the company you want to see</small>
            </div>
            <div className="form-group">
              <label>Job Role</label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <small>
                Type or select a software / IT role
              </small>
            </div>
          </div>

          <button
            className="find-button"
            onClick={findJobs}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Finding matching jobs...
              </>
            ) : (
              <>
                Find Matching Jobs
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </section>

      {searched && (
        <section className="jobs-section" id="jobs">
          <div className="results-header">
            <div>
              <span className="section-label">JOB RESULTS</span>
              <h2>Recommended Jobs</h2>
              <p>
                Opportunities matched with your profile.
              </p>
            </div>

            <div className="result-count">
              {jobs.length} Jobs Found
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <h3>No matching jobs found</h3>
              <p>
                Try adding more skills or changing your preferred role
                or location.
              </p>
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <div className="job-card" key={job._id}>
                  <div className="job-card-header">
                    <div className="company-logo">
                      {job.company?.charAt(0)}
                    </div>

                    <div className="match-badge">
                      {job.matchScore}% Match
                    </div>
                  </div>

                  <div className="job-content">
                    <h3>{job.title}</h3>

                    <div className="company-name">
                      {job.company}
                    </div>

                    <div className="job-details">
                      <span>📍 {job.location}</span>
                      <span>💼 {job.jobType}</span>
                    </div>

                    <p className="job-description">
                      {cleanJobDescription(job.description)}
                    </p>

                    <div className="skills">
                      {(job.skills || []).map((skill, index) => (
                        <span key={`${skill}-${index}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="job-card-footer">
                    <span className="role-text">
                      {job.role}
                    </span>

                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="apply-button"
                    >
                      View Job →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="how-section">
        <div className="section-heading center">
          <span className="section-label">HOW IT WORKS</span>
          <h2>Finding your next job is simple</h2>
          <p>
            Three simple steps to discover relevant opportunities.
          </p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Create Profile</h3>
            <p>
              Add your skills, preferred role and location.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <h3>Get Matched</h3>
            <p>
              Our system compares your profile with available jobs.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <h3>Apply</h3>
            <p>
              Explore matching opportunities and apply directly.
            </p>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="logo">
            <div className="logo-icon">J</div>
            <span>JobFinder</span>
          </div>

          <p>
            Helping freshers discover better job opportunities.
          </p>

          <span className="footer-copy">
            © 2026 JobFinder
          </span>
        </div>
      </footer>

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Arial, sans-serif;
          background: #f8fafc;
          color: #172033;
        }

        button,
        input,
        select {
          font: inherit;
        }

        .app {
          min-height: 100vh;
          overflow-x: hidden;
        }

        .navbar {
          background: rgba(255,255,255,0.96);
          border-bottom: 1px solid #e8edf4;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .nav-container {
          max-width: 1180px;
          margin: auto;
          height: 72px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 800;
          color: #172033;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #2563eb;
          color: white;
          font-weight: 800;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .nav-links a {
          text-decoration: none;
          color: #596579;
          font-size: 14px;
          font-weight: 600;
        }

        .nav-links a:hover {
          color: #2563eb;
        }

        .nav-button {
          border: none;
          background: #172033;
          color: white;
          padding: 11px 19px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .hero {
          max-width: 1180px;
          min-height: 480px;
          margin: auto;
          padding: 75px 24px;
          display: grid;
          grid-template-columns: 1.15fr .85fr;
          align-items: center;
          gap: 40px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #eaf2ff;
          color: #2563eb;
          padding: 8px 13px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 22px;
        }

        .hero h1 {
          font-size: clamp(44px, 6vw, 68px);
          line-height: 1.04;
          letter-spacing: -3px;
          margin-bottom: 22px;
        }

        .hero h1 span {
          color: #2563eb;
        }

        .hero-content > p {
          max-width: 570px;
          color: #687386;
          font-size: 18px;
          line-height: 1.7;
        }

        .hero-stats {
          display: flex;
          gap: 48px;
          margin-top: 38px;
        }

        .hero-stats div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hero-stats strong {
          font-size: 24px;
        }

        .hero-stats span {
          color: #7b8798;
          font-size: 12px;
        }

        .hero-decoration {
          height: 330px;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-circle {
          width: 290px;
          height: 290px;
          border-radius: 50%;
          background: #e9f1ff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-circle-inner {
          width: 205px;
          height: 205px;
          border-radius: 50%;
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 25px 60px rgba(37,99,235,.25);
        }

        .hero-circle-inner span {
          color: white;
          font-size: 90px;
          font-weight: 900;
        }

        .floating-card {
          position: absolute;
          background: white;
          padding: 14px 18px;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(30,50,80,.12);
          font-size: 13px;
          font-weight: 700;
          z-index: 2;
        }

        .floating-card span {
          color: #2563eb;
          margin-right: 8px;
        }

        .card-one {
          left: 5px;
          top: 35px;
        }

        .card-two {
          right: 0;
          bottom: 45px;
        }

        .profile-section,
        .jobs-section {
          max-width: 1080px;
          margin: auto;
          padding: 60px 24px;
        }

        .section-label {
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .section-heading h2,
        .results-header h2 {
          font-size: 34px;
          letter-spacing: -1px;
          margin-top: 7px;
        }

        .section-heading p,
        .results-header p {
          color: #7b8798;
          margin-top: 8px;
        }

        .profile-card {
          margin-top: 30px;
          background: white;
          border: 1px solid #e5eaf1;
          border-radius: 18px;
          padding: 30px;
          box-shadow: 0 10px 35px rgba(20,40,70,.05);
        }

        .profile-card-top {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 28px;
        }

        .profile-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #eef4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
        }

        .profile-card-top h3 {
          font-size: 18px;
        }

        .profile-card-top p {
          color: #7b8798;
          font-size: 13px;
          margin-top: 4px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select,
        .custom-select {
          width: 100%;
          height: 48px;
          border: 1px solid #dbe2eb;
          border-radius: 9px;
          padding: 0 14px;
          font-size: 14px;
          outline: none;
          background: white;
          color: #172033;
          transition: .2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .custom-select-open {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.09);
        }

        .form-group input:disabled,
        .form-group select:disabled,
        .custom-select:disabled {
          opacity: .65;
          cursor: wait;
        }

        .custom-select {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
        }

        .selected-value {
          color: #172033;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .placeholder-value {
          color: #9aa6b6;
        }

        .select-arrow {
          font-size: 11px;
          color: #394456;
          margin-left: 12px;
          transition: transform .2s;
        }

        .custom-select-open .select-arrow {
          transform: rotate(180deg);
        }

        .skills-dropdown {
          position: absolute;
          left: 0;
          right: 0;
          top: 76px;
          background: #202020;
          color: white;
          border-radius: 0 0 10px 10px;
          padding: 10px 8px 8px;
          max-height: 280px;
          overflow-y: auto;
          z-index: 60;
          box-shadow: 0 18px 35px rgba(0,0,0,.22);
          border: 1px solid #333;
        }

        .skills-dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 10px 10px;
          font-size: 12px;
          font-weight: 700;
          border-bottom: 1px solid #343434;
          margin-bottom: 3px;
        }

        .skills-dropdown-header button {
          border: none;
          background: none;
          color: #8eb6ff;
          font-size: 12px;
          cursor: pointer;
        }

        .skill-option {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 13px;
        }

        .skill-option:hover {
          background: #2d2d2d;
        }

        .skill-option input {
          width: 15px;
          height: 15px;
          margin: 0;
          accent-color: #2563eb;
          cursor: pointer;
        }

        .form-group small {
          color: #98a2b1;
          margin-top: 6px;
          font-size: 11px;
        }

        .find-button {
          margin-top: 27px;
          width: 100%;
          height: 50px;
          border: none;
          border-radius: 9px;
          background: #2563eb;
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: .2s;
        }

        .find-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .find-button:disabled {
          opacity: .7;
          cursor: wait;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .jobs-section {
          padding-top: 20px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 28px;
        }

        .result-count {
          background: #eef4ff;
          color: #2563eb;
          padding: 9px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .job-card {
          background: white;
          border: 1px solid #e4e9f0;
          border-radius: 15px;
          overflow: hidden;
          transition: .2s;
        }

        .job-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(20,40,70,.09);
          border-color: #cdd9ec;
        }

        .job-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px 0;
        }

        .company-logo {
          width: 44px;
          height: 44px;
          border-radius: 11px;
          background: #172033;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
        }

        .match-badge {
          color: #15803d;
          background: #ecfdf3;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
        }

        .job-content {
          padding: 20px;
        }

        .job-content h3 {
          font-size: 20px;
          margin-bottom: 5px;
        }

        .company-name {
          color: #2563eb;
          font-weight: 700;
          font-size: 14px;
        }

        .job-details {
          display: flex;
          gap: 18px;
          margin-top: 15px;
          color: #758194;
          font-size: 12px;
        }

        .job-description {
          color: #707b8d;
          font-size: 13px;
          line-height: 1.6;
          margin-top: 15px;
        }

        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 16px;
        }

        .skills span {
          background: #f1f5f9;
          color: #526174;
          padding: 6px 9px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        .job-card-footer {
          border-top: 1px solid #edf0f4;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .role-text {
          color: #8a95a5;
          font-size: 11px;
        }

        .apply-button {
          text-decoration: none;
          color: #2563eb;
          font-size: 13px;
          font-weight: 800;
        }

        .empty-state {
          background: white;
          border: 1px solid #e5eaf1;
          border-radius: 15px;
          padding: 60px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 55px;
          height: 55px;
          margin: auto;
          border-radius: 50%;
          background: #eef4ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
        }

        .empty-state h3 {
          margin-top: 15px;
        }

        .empty-state p {
          color: #7b8798;
          font-size: 13px;
          margin-top: 7px;
        }

        .how-section {
          background: white;
          border-top: 1px solid #e9edf3;
          margin-top: 30px;
          padding: 75px 24px;
        }

        .center {
          text-align: center;
        }

        .steps {
          max-width: 1000px;
          margin: 45px auto 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
        }

        .step {
          text-align: center;
          padding: 20px;
        }

        .step-number {
          color: #2563eb;
          font-weight: 900;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .step h3 {
          font-size: 18px;
        }

        .step p {
          color: #7b8798;
          font-size: 13px;
          line-height: 1.6;
          margin-top: 8px;
        }

        footer {
          background: #172033;
          color: white;
        }

        .footer-content {
          max-width: 1180px;
          min-height: 100px;
          margin: auto;
          padding: 25px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .footer-content .logo {
          color: white;
        }

        .footer-content p {
          color: #9ca7b8;
          font-size: 12px;
        }

        .footer-copy {
          color: #9ca7b8;
          font-size: 11px;
        }

        @media (max-width: 800px) {
          .nav-links a {
            display: none;
          }

          .hero {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 55px;
          }

          .hero-content > p {
            margin: auto;
          }

          .hero-stats {
            justify-content: center;
          }

          .hero-decoration {
            display: none;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .jobs-grid {
            grid-template-columns: 1fr;
          }

          .steps {
            grid-template-columns: 1fr;
          }

          .results-header {
            align-items: start;
            flex-direction: column;
            gap: 15px;
          }

          .footer-content {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 500px) {
          .hero h1 {
            font-size: 43px;
            letter-spacing: -2px;
          }

          .hero-stats {
            gap: 22px;
          }

          .profile-card {
            padding: 20px;
          }

          .profile-section,
          .jobs-section {
            padding-left: 16px;
            padding-right: 16px;
          }

          .skills-dropdown {
            position: fixed;
            left: 16px;
            right: 16px;
            top: 140px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
