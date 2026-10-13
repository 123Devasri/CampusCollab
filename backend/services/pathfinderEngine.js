const axios = require("axios");

/**
 * Intelligent deterministic & rule-based planning engine
 * Deconstructs project problems into domain-specific, unique architectural roadmaps,
 * intelligently matches skills to tasks, calculates topological schedules & deadlines,
 * and analyzes risk factors.
 */

// Categorized domain knowledge profiles
const DOMAIN_PROFILES = {
  emergency_safety: {
    domainName: "Emergency Safety & Real-Time Alert System",
    architecturePattern: "Event-Driven Pub/Sub with Geolocation & WebSockets Gateway",
    coreEntity: "AlertIncident, GuardDispatch, GeofenceZone",
    backendFocus: "WebSockets server, SMS/Twilio dispatch queue, geospatial query indexing",
    frontendFocus: "Live dispatch incident map, audio SOS trigger, status badge stream",
    defaultApis: ["Leaflet/Mapbox API", "Twilio SMS", "WebSockets / Socket.io", "Geolocation API"]
  },
  healthcare: {
    domainName: "HealthTech & Clinical Workflow System",
    architecturePattern: "HIPAA-Compliant Tiered Micro-Service with Telehealth Streaming",
    coreEntity: "PatientRecord, DoctorSchedule, VitalSignsMetric, Prescription",
    backendFocus: "Encrypted FHIR/HL7 data schemas, appointment state machine, secure token auth",
    frontendFocus: "Patient vitals sparkline dashboard, triage queue list, tele-consult portal",
    defaultApis: ["WebRTC", "Chart.js / Recharts", "SendGrid Email", "AES-256 Encryption"]
  },
  fintech: {
    domainName: "FinTech & Secure Transaction Ledger",
    architecturePattern: "Double-Entry Ledger with Idempotent Payment Webhook Processing",
    coreEntity: "LedgerAccount, TransactionRecord, FraudAuditLog, PayoutBatch",
    backendFocus: "ACID transaction guarantees, idempotency keys, fraud score calculations",
    frontendFocus: "Real-time balance breakdown, transaction filter timeline, invoice export",
    defaultApis: ["Stripe / Razorpay API", "PDFKit", "Redis Cache", "HMAC Webhook Signatures"]
  },
  ai_ml: {
    domainName: "AI/ML Intelligence & Inference Engine",
    architecturePattern: "Decoupled Inference Pipeline with Vector Retrieval & Reactive UI",
    coreEntity: "EmbeddingVector, InferencePrompt, ModelFeedback, DatasetSample",
    backendFocus: "Asynchronous Python FastAPI inference worker, vector embeddings store, batch queues",
    frontendFocus: "Live token stream chat, confidence gauge bars, multimodal upload dropzone",
    defaultApis: ["Hugging Face APIs", "FastAPI", "ChromaDB / Pinecone", "Axios Stream"]
  },
  iot_hardware: {
    domainName: "IoT Telemetry & Smart Sensor Network",
    architecturePattern: "MQTT Ingestion Broker with Time-Series Storage & Live Gauges",
    coreEntity: "DeviceNode, SensorTelemetry, AlertThresholdRule, NodeHeartbeat",
    backendFocus: "MQTT subscriber daemon, time-series data rollup, anomaly detection threshold checks",
    frontendFocus: "Live instrument dials, device uptime heartbeat cards, sensor trend graphs",
    defaultApis: ["MQTT.js / Mosquitto", "WebSockets", "InfluxDB / MongoDB TimeSeries", "Canvas Gauge"]
  },
  edtech: {
    domainName: "EdTech & Interactive Peer Learning Platform",
    architecturePattern: "Gamified Modular Course Engine with Real-Time Collaboration",
    coreEntity: "CourseModule, StudentProgress, QuizSubmission, PeerReviewComment",
    backendFocus: "Automated test runner, milestone progression tracker, leaderboard indexing",
    frontendFocus: "Interactive quiz stepper, syllabus milestone progress tree, markdown viewer",
    defaultApis: ["Markdown Parser", "Socket.io", "Monaco Code Editor", "Chart.js"]
  },
  ecommerce_logistics: {
    domainName: "E-Commerce & Smart Logistics Marketplace",
    architecturePattern: "Event-Sourced Cart State Machine with Route Optimization",
    coreEntity: "ProductSKU, OrderItem, DeliveryTrip, InventoryReservation",
    backendFocus: "Optimistic concurrency cart locking, distance routing matrix, payment webhooks",
    frontendFocus: "Filterable product grid, live order transit progress stepper, cart drawer",
    defaultApis: ["Stripe API", "Google Maps Distance Matrix", "Cloudinary", "Elasticsearch / Mongo text search"]
  },
  cybersecurity: {
    domainName: "Cybersecurity & Threat Telemetry Platform",
    architecturePattern: "Zero-Trust Audit Log Ingestion with Automated Rule Scanner",
    coreEntity: "SecurityIncident, VulnerabilityScan, AuditToken, AccessPolicy",
    backendFocus: "Log parsing regex pipelines, token revocation blacklist, threat severity matrix",
    frontendFocus: "Threat radar visualizer, incident severity badge stream, IP inspection panel",
    defaultApis: ["JWT Auth", "IP Geolocation API", "Cryptographic Hashing", "WebSockets"]
  },
  general_collab: {
    domainName: "Smart Collaboration & Real-Time Workflow Platform",
    architecturePattern: "Layered REST Client-Server with Reactive State Synchronization",
    coreEntity: "ProjectWorkspace, UserProfile, ActivityLog, CollaborativeItem",
    backendFocus: "Normalized data persistence, REST controller envelopes, session management",
    frontendFocus: "Responsive dashboard cards, multi-criteria search filters, status indicators",
    defaultApis: ["Axios", "Bootstrap 5", "JWT Auth", "Dotenv"]
  }
};

/**
 * Normalizes an array of skill strings to lowercase sets
 */
function normalizeSkills(skillsArray) {
  if (!Array.isArray(skillsArray)) return new Set();
  return new Set(
    skillsArray
      .map((s) => (typeof s === "string" ? s.trim().toLowerCase() : ""))
      .filter(Boolean)
  );
}

/**
 * Identify specific domain profile from problem text
 */
function detectDomainProfile(problemStatement, expectedOutcome, specifiedCategory) {
  const combined = `${problemStatement} ${expectedOutcome} ${specifiedCategory}`.toLowerCase();

  if (/emergency|safety|alert|police|guard|warden|disaster|sos|rescue|ambulance/i.test(combined)) {
    return DOMAIN_PROFILES.emergency_safety;
  }
  if (/health|hospital|doctor|patient|medical|triage|clinic|vitals|medicine/i.test(combined)) {
    return DOMAIN_PROFILES.healthcare;
  }
  if (/finance|bank|money|payment|fraud|ledger|wallet|crypto|invoice|credit/i.test(combined)) {
    return DOMAIN_PROFILES.fintech;
  }
  if (/ai|ml|machine learning|deep learning|nlp|vision|detect|model|predict|hugging|gpt/i.test(combined)) {
    return DOMAIN_PROFILES.ai_ml;
  }
  if (/iot|hardware|sensor|arduino|raspberry|mqtt|esp32|soil|temperature|device/i.test(combined)) {
    return DOMAIN_PROFILES.iot_hardware;
  }
  if (/student|course|learn|quiz|exam|school|college|education|teach|mentor/i.test(combined)) {
    return DOMAIN_PROFILES.edtech;
  }
  if (/ecommerce|shop|cart|delivery|order|product|inventory|store|market/i.test(combined)) {
    return DOMAIN_PROFILES.ecommerce_logistics;
  }
  if (/security|cyber|vulnerability|audit|auth|attack|malware|threat|token/i.test(combined)) {
    return DOMAIN_PROFILES.cybersecurity;
  }
  return DOMAIN_PROFILES.general_collab;
}

/**
 * Checks for stack incompatibilities or warnings
 */
function evaluateStackSuitability(specifiedStack, projectType, isAI) {
  const warnings = [];
  const frontends = (specifiedStack?.frontend || []).map((s) => s.toLowerCase());
  const backends = (specifiedStack?.backend || []).map((s) => s.toLowerCase());
  const databases = (specifiedStack?.database || []).map((s) => s.toLowerCase());

  if (projectType?.includes("24-hour") && frontends.includes("angular") && backends.includes("spring boot")) {
    warnings.push("Angular + Spring Boot has high initial setup overhead for a fast hackathon sprint. Recommended to utilize lightweight REST templates.");
  }

  if (isAI && !backends.some((b) => b.includes("python") || b.includes("fastapi") || b.includes("flask"))) {
    warnings.push("AI model inferencing requested, but backend does not list Python/FastAPI. Recommended to use a Python microservice with your primary backend.");
  }

  if (databases.length === 0) {
    warnings.push("No database selected. A document store like MongoDB or SQLite is recommended for rapid prototyping.");
  }

  return warnings.join(" ");
}

/**
 * Generate structured problem analysis (maintained for schema backward compatibility)
 */
function generateProblemAnalysis(input) {
  const { title, problemStatement, expectedOutcome, targetUsers, mandatoryRequirements } = input;
  const domain = detectDomainProfile(problemStatement, expectedOutcome, input.projectCategory);

  return {
    simplifiedExplanation: `Project "${title}" addresses: ${problemStatement.slice(0, 160)}... Target persona: ${targetUsers || "Platform Users"}.`,
    mainObjectives: [
      `Deliver working MVP for ${domain.domainName}`,
      expectedOutcome ? `Outcome: ${expectedOutcome}` : "Deliver validated end-to-end prototype",
      `Resolve core user friction for: ${targetUsers || "Students & Users"}`
    ],
    functionalRequirements: [
      `Data models: ${domain.coreEntity}`,
      `Core business workflow: ${domain.backendFocus}`,
      `Interactive views: ${domain.frontendFocus}`,
      ...(mandatoryRequirements || [])
    ],
    nonFunctionalRequirements: [
      "Sub-500ms API response time",
      "Mobile-responsive layout",
      "Reliable live demo operation"
    ],
    majorTechnicalChallenges: [
      `Implementing ${domain.backendFocus} within hackathon constraints`,
      "State synchronization between client and backend"
    ],
    assumptionsAndUnknowns: [
      "Standard development environment available",
      "External mock fallback for 3rd-party APIs"
    ],
    successCriteria: [
      "End-to-end working demonstration",
      "Zero unhandled runtime crashes"
    ]
  };
}

/**
 * Recommend architecture and tech choices strictly adapted to the problem and members' real skills
 */
function recommendArchitectureAndTech(input, memberSnapshots) {
  const { planningMode, specifiedStack, problemStatement, expectedOutcome, projectCategory } = input;
  const domain = detectDomainProfile(problemStatement, expectedOutcome, projectCategory);

  // Union of team member skills
  const teamSkills = new Set();
  const memberNamesBySkill = {};
  (memberSnapshots || []).forEach((m) => {
    (m.technicalSkills || []).forEach((s) => {
      const lower = s.trim().toLowerCase();
      teamSkills.add(lower);
      if (!memberNamesBySkill[lower]) memberNamesBySkill[lower] = [];
      memberNamesBySkill[lower].push(m.name);
    });
  });

  let frontendTech = [];
  let backendTech = [];
  let databaseTech = [];
  let apisAndLibraries = [];
  let rationale = "";
  let stackWarnings = "";

  if (planningMode === "specified_stack" && specifiedStack) {
    frontendTech = specifiedStack.frontend && specifiedStack.frontend.length > 0 ? specifiedStack.frontend : ["React.js", "Bootstrap 5"];
    backendTech = specifiedStack.backend && specifiedStack.backend.length > 0 ? specifiedStack.backend : ["Node.js", "Express.js"];
    databaseTech = specifiedStack.database && specifiedStack.database.length > 0 ? specifiedStack.database : ["MongoDB"];
    apisAndLibraries = [
      ...(specifiedStack.frameworks || []),
      ...(specifiedStack.apisAndServices || []),
      ...(specifiedStack.aiMlTools || [])
    ];
    stackWarnings = evaluateStackSuitability(specifiedStack, input.constraints?.projectType, domain === DOMAIN_PROFILES.ai_ml);
    rationale = `Configured specifically to your squad's chosen stack. Modules and tasks are directly tailored to ${domain.domainName}.`;
  } else {
    // Mode A: Guide From Scratch - synthesize based on actual member skills and domain
    const hasPython = [...teamSkills].some((s) => /python|fastapi|flask|django/i.test(s));
    const hasReact = [...teamSkills].some((s) => /react|next/i.test(s));
    const hasNode = [...teamSkills].some((s) => /node|express|javascript|js/i.test(s));
    const hasMongo = [...teamSkills].some((s) => /mongo|nosql/i.test(s));
    const hasSQL = [...teamSkills].some((s) => /sql|postgres|mysql/i.test(s));
    const hasFlutter = [...teamSkills].some((s) => /flutter|dart|mobile/i.test(s));

    // Frontend determination
    if (hasFlutter) {
      frontendTech = ["Flutter (Mobile)", "Material Design"];
    } else if (hasReact) {
      frontendTech = ["React.js", "Bootstrap 5 / Modern CSS"];
    } else {
      frontendTech = ["Modern JavaScript (ES6+)", "Responsive CSS3"];
    }

    // Backend determination
    if (domain === DOMAIN_PROFILES.ai_ml || (hasPython && !hasNode)) {
      backendTech = ["FastAPI (Python)", "REST API Service"];
      apisAndLibraries = [...domain.defaultApis, "Uvicorn", "Pydantic"];
    } else if (hasNode || (!hasPython && !hasNode)) {
      backendTech = ["Node.js", "Express.js REST Engine"];
      apisAndLibraries = [...domain.defaultApis, "Axios", "Dotenv", "CORS"];
    } else {
      backendTech = ["Python", "FastAPI"];
      apisAndLibraries = [...domain.defaultApis];
    }

    // Database determination
    if (hasSQL) {
      databaseTech = ["PostgreSQL / Supabase"];
    } else if (hasMongo || (!hasSQL && !hasMongo)) {
      databaseTech = ["MongoDB with Mongoose"];
    }

    // Identify team members who already know these tools
    const matchedTeammates = (memberSnapshots || [])
      .filter((m) => (m.technicalSkills || []).some((s) => teamSkills.has(s.toLowerCase())))
      .map((m) => m.name);

    rationale = `Customized for ${domain.domainName}: Employs ${frontendTech[0]} & ${backendTech[0]} to leverage existing skills from ${matchedTeammates.length > 0 ? matchedTeammates.slice(0, 2).join(" & ") : "your squad"}, ensuring zero onboarding friction and rapid hackathon completion.`;
  }

  const recommendedArchitecture = `${domain.architecturePattern}: Clean modular division between ${frontendTech.join(", ")} and ${backendTech.join(", ")}, backed by ${databaseTech.join(", ")}.`;

  return {
    recommendedArchitecture,
    frontendTech,
    backendTech,
    databaseTech,
    apisAndLibraries,
    mainModulesOverview: [
      `1. Foundation & ${domain.coreEntity.split(",")[0]} Schemas`,
      `2. ${domain.backendFocus.split(",")[0]} Engine`,
      `3. ${domain.frontendFocus.split(",")[0]} Dashboard`,
      "4. Full-Stack Data Flow & State Integration",
      "5. Cloud Deployment & Live Pitch Readiness"
    ],
    dataFlowSummary: `User triggers action -> ${backendTech[0]} validates request -> Data saved to ${databaseTech[0]} -> Real-time feedback rendered on ${frontendTech[0]}.`,
    deploymentApproach: "Live cloud deployment on Vercel / Render with public HTTPS endpoint.",
    selectionRationale: rationale,
    stackIncompatibilitiesWarning: stackWarnings
  };
}

/**
 * Generate implementable modules with clear, concise, non-clumsy beginner guidance
 */
function generateModules(input, arch) {
  const { title, problemStatement, expectedOutcome, projectCategory } = input;
  const domain = detectDomainProfile(problemStatement, expectedOutcome, projectCategory);
  const entities = domain.coreEntity.split(",").map((e) => e.trim());

  return [
    {
      name: `Module 1: Foundation & ${entities[0]} Schemas`,
      purpose: `Establish repository scaffolding and database models for ${entities.slice(0, 2).join(" & ")}.`,
      priority: "Must Have",
      requiredTechnologies: [...arch.backendTech, ...arch.databaseTech],
      features: [
        "Git repository setup & environment configuration",
        `Database schemas for ${entities.slice(0, 2).join(" & ")}`,
        "Backend server health check endpoint"
      ],
      implementationSequence: [
        "Initialize Git repository and share access with team members",
        `Define Mongoose/SQL schema for ${entities[0]} with validation rules`,
        "Start server locally and test database connection"
      ],
      firstStep: "Clone repo, copy .env.example, and verify database connection on local port.",
      keyConcepts: ["Git Branching", "Schema Validation", "Environment Variables"],
      learningResources: [
        { title: "Express/FastAPI Quickstart", url: "https://expressjs.com/", notes: "Server scaffolding" }
      ],
      testingInstructions: [
        "GET / returns 200 OK",
        "Database connects successfully without timeout errors"
      ],
      commonPitfalls: [
        "Committing .env or passwords to Git repository"
      ],
      estimatedTotalHours: 3
    },
    {
      name: `Module 2: ${domain.domainName.split("&")[0].trim()} Core API`,
      purpose: `Implement the primary business computation and REST endpoints for ${title}.`,
      priority: "Must Have",
      requiredTechnologies: [...arch.backendTech, ...arch.apisAndLibraries],
      features: [
        `REST endpoints to create and query ${entities[0]} data`,
        `Core logic: ${domain.backendFocus}`,
        "Input sanitization, query filters, and clean JSON errors"
      ],
      implementationSequence: [
        "Write route handlers with test JSON responses",
        `Implement controller logic to process and persist ${entities[0]}`,
        "Test all endpoints using Postman or Thunder Client"
      ],
      firstStep: "Agree on the API request/response JSON format with your frontend teammates before writing code.",
      keyConcepts: ["Async/Await", "HTTP Status Codes", "Payload Sanitization"],
      learningResources: [
        { title: "REST API Design", url: "https://restfulapi.net/", notes: "Clean endpoint naming" }
      ],
      testingInstructions: [
        "POST request creates item and returns 201 Created",
        "Invalid input returns friendly 400 Bad Request error"
      ],
      commonPitfalls: [
        "Not handling server errors with try/catch, causing the server to crash"
      ],
      estimatedTotalHours: 6
    },
    {
      name: `Module 3: ${domain.frontendFocus.split(",")[0].trim()} UI`,
      purpose: `Build interactive, responsive frontend views and dashboards for ${title}.`,
      priority: "Must Have",
      requiredTechnologies: [...arch.frontendTech],
      features: [
        "Responsive layout shell and navigation bar",
        "Interactive input forms with real-time validation",
        `Dashboard view displaying ${entities[0]} status cards`
      ],
      implementationSequence: [
        "Create responsive card layout and form components",
        "Add client-side form validation and state hooks",
        "Add clean loading spinners and empty-state placeholders"
      ],
      firstStep: "Build the main dashboard wireframe and test layout on mobile screen size.",
      keyConcepts: ["Component State", "Form Validation", "Responsive Layout"],
      learningResources: [
        { title: "React State Guide", url: "https://react.dev/learn", notes: "Managing form state" }
      ],
      testingInstructions: [
        "Form prevents submit if required fields are missing",
        "Layout displays cleanly on mobile (375px) and laptop (1280px)"
      ],
      commonPitfalls: [
        "Neglecting loading states, leading to confusing frozen screens"
      ],
      estimatedTotalHours: 5
    },
    {
      name: "Module 4: Full-Stack Integration & Live Flow",
      purpose: "Connect frontend components directly to backend APIs with live user feedback.",
      priority: "Must Have",
      requiredTechnologies: [...arch.frontendTech, ...arch.backendTech],
      features: [
        "API service client connecting frontend to backend endpoints",
        "Interactive toasts for success, error, and progress states",
        "Complete round-trip verification: Input -> Save -> Query -> Render"
      ],
      implementationSequence: [
        "Set up centralized Axios/Fetch API service helper",
        "Connect form submissions to backend POST endpoints",
        "Verify newly added records appear immediately in the UI"
      ],
      firstStep: "Perform a single test API call from frontend to backend and confirm successful response.",
      keyConcepts: ["CORS Configuration", "Promise Handling", "State Synchronization"],
      learningResources: [
        { title: "Axios API Docs", url: "https://axios-http.com/", notes: "Client-server communication" }
      ],
      testingInstructions: [
        "Submitted data saves to DB and updates UI list immediately",
        "Simulate disconnected server to confirm user error alert works"
      ],
      commonPitfalls: [
        "CORS errors due to missing cors() middleware on backend"
      ],
      estimatedTotalHours: 4
    },
    {
      name: "Module 5: Cloud Deployment & Live Demo Readiness",
      purpose: "Deploy live URL, test edge cases, and prepare a concise 3-minute pitch.",
      priority: "Should Have",
      requiredTechnologies: ["Git", "Cloud Hosting (Vercel/Render)"],
      features: [
        "Live public production URL with SSL",
        "Edge-case testing (empty fields, rapid clicks, long text)",
        "Pre-seeded demonstration data for judging pitch"
      ],
      implementationSequence: [
        "Deploy backend to Render/Railway and frontend to Vercel",
        "Seed 2-3 realistic sample records so the app is not empty during demo",
        "Rehearse live 3-minute walkthrough pitch"
      ],
      firstStep: "Deploy the app to cloud 6 hours before deadline to avoid last-minute deployment bugs.",
      keyConcepts: ["Production Build", "Demo Storytelling", "Seed Data"],
      learningResources: [
        { title: "Vite/Vercel Deploy", url: "https://vitejs.dev/guide/static-deploy.html", notes: "Cloud deployment" }
      ],
      testingInstructions: [
        "Open live URL in private browser window and verify complete flow",
        "Confirm zero red errors in browser developer console"
      ],
      commonPitfalls: [
        "Leaving deployment to the last 30 minutes before hackathon judging"
      ],
      estimatedTotalHours: 3
    }
  ];
}

/**
 * Intelligent task generation directly tailored to the domain & title
 */
function generateRawTasks(modules, title, domain) {
  const entities = domain.coreEntity.split(",").map((e) => e.trim());

  return [
    {
      taskId: "TASK-101",
      title: "Workspace Scaffolding, Git Repo & Branching Setup",
      moduleName: modules[0].name,
      description: "Initialize project repository, setup .env configuration, and establish clean folder structure.",
      skillsRequired: ["Git", "Project Setup", "JavaScript"],
      estimatedHours: 2,
      priority: "Critical",
      dependencies: [],
      acceptanceCriteria: [
        "Repo accessible to all squad members",
        "Clean frontend and backend separation"
      ]
    },
    {
      taskId: "TASK-102",
      title: `Define Backend Database Schemas for ${entities[0]}`,
      moduleName: modules[0].name,
      description: `Create database schemas, validation rules, and connection handler for ${entities.slice(0, 2).join(" & ")}.`,
      skillsRequired: ["Database", "MongoDB", "Mongoose", "Backend"],
      estimatedHours: 2,
      priority: "Critical",
      dependencies: ["TASK-101"],
      acceptanceCriteria: [
        `Database persists ${entities[0]} records with validation`,
        "Database connects cleanly on local startup"
      ]
    },
    {
      taskId: "TASK-103",
      title: `Build REST API Endpoints for ${entities[0]} Management`,
      moduleName: modules[1].name,
      description: `Develop GET, POST, and PUT route controllers with JSON envelopes for ${entities[0]}.`,
      skillsRequired: ["Node.js", "Express", "REST APIs", "Backend"],
      estimatedHours: 4,
      priority: "High",
      dependencies: ["TASK-102"],
      acceptanceCriteria: [
        "Endpoints respond with 200/201 on success and 400 on bad data",
        "Tested with Postman / curl"
      ]
    },
    {
      taskId: "TASK-104",
      title: `Implement ${domain.backendFocus.split(",")[0].trim()} Business Logic`,
      moduleName: modules[1].name,
      description: `Develop specialized processing rules for ${title} to handle real-world operations.`,
      skillsRequired: ["Backend", "Algorithms", "Node.js", "Python"],
      estimatedHours: 3,
      priority: "High",
      dependencies: ["TASK-103"],
      acceptanceCriteria: [
        "Core domain calculations process accurately",
        "Edge cases return clean errors without crashing"
      ]
    },
    {
      taskId: "TASK-105",
      title: "Build Responsive Shell Layout & Navigation Bar",
      moduleName: modules[2].name,
      description: "Construct responsive layout grid, navbar, and theme styles matching CampusCollab tokens.",
      skillsRequired: ["React", "HTML/CSS", "Bootstrap", "UI/UX"],
      estimatedHours: 2,
      priority: "High",
      dependencies: ["TASK-101"],
      acceptanceCriteria: [
        "Header and layout adjust smoothly to mobile and desktop screens",
        "Clean, modern UI without visual clutter"
      ]
    },
    {
      taskId: "TASK-106",
      title: `Develop Input Forms & Real-Time Validation for ${entities[0]}`,
      moduleName: modules[2].name,
      description: `Implement interactive input forms with field validation and friendly error banners.`,
      skillsRequired: ["React", "JavaScript", "Frontend"],
      estimatedHours: 3,
      priority: "High",
      dependencies: ["TASK-105"],
      acceptanceCriteria: [
        "Form catches empty/invalid fields before submission",
        "Clean submit loading spinner"
      ]
    },
    {
      taskId: "TASK-107",
      title: `Create Dashboard View for ${entities[0]} Status Cards`,
      moduleName: modules[2].name,
      description: "Build visual summary cards, status badges, and empty-state placeholders for active items.",
      skillsRequired: ["React", "UI/UX", "Frontend"],
      estimatedHours: 3,
      priority: "Medium",
      dependencies: ["TASK-105"],
      acceptanceCriteria: [
        "Summary cards display clean numbers and status badges",
        "Helpful empty states for first-time use"
      ]
    },
    {
      taskId: "TASK-108",
      title: "Full-Stack API Integration & State Synchronization",
      moduleName: modules[3].name,
      description: "Connect frontend forms to live backend endpoints via API client and manage loading states.",
      skillsRequired: ["React", "REST APIs", "JavaScript", "Full Stack"],
      estimatedHours: 4,
      priority: "Critical",
      dependencies: ["TASK-103", "TASK-106", "TASK-107"],
      acceptanceCriteria: [
        "Form submission creates database record and updates UI instantly",
        "Network errors caught and displayed via clean toast"
      ]
    },
    {
      taskId: "TASK-109",
      title: "End-to-End Smoke Testing & Edge-Case Verification",
      moduleName: modules[4].name,
      description: "Walk through complete user journey, test invalid entries, and check console for zero errors.",
      skillsRequired: ["Testing", "Quality Assurance", "Debugging"],
      estimatedHours: 2,
      priority: "High",
      dependencies: ["TASK-108"],
      acceptanceCriteria: [
        "Zero uncaught red console errors",
        "All user actions complete smoothly"
      ]
    },
    {
      taskId: "TASK-110",
      title: "Cloud Deployment, Live Public URL & Demo Pitch Prep",
      moduleName: modules[4].name,
      description: "Deploy to cloud (Vercel/Render), seed 2-3 sample records for live demo, and prepare 3-minute pitch.",
      skillsRequired: ["DevOps", "Deployment", "Git"],
      estimatedHours: 2,
      priority: "Critical",
      dependencies: ["TASK-109"],
      acceptanceCriteria: [
        "Live URL loads cleanly in Incognito window",
        "Pre-seeded demo records ready for judging walkthrough"
      ]
    }
  ];
}

/**
 * Intelligent skill-based task allocation respecting member availability and experience
 */
function allocateTasks(tasks, memberSnapshots) {
  if (!memberSnapshots || memberSnapshots.length === 0) {
    return tasks.map((t) => ({
      ...t,
      assignedTo: null,
      assignedMemberName: "Unassigned",
      assignmentReason: "No team members configured. Assign tasks as members join."
    }));
  }

  // Track member committed workload in hours
  const memberWorkload = {};
  memberSnapshots.forEach((m) => {
    const id = String(m.userId || m._id || m.name);
    memberWorkload[id] = 0;
  });

  return tasks.map((task) => {
    let bestMember = null;
    let highestScore = -1;

    const taskRequiredSet = normalizeSkills(task.skillsRequired);

    memberSnapshots.forEach((member) => {
      const id = String(member.userId || member._id || member.name);
      const memberSkillsSet = normalizeSkills(member.technicalSkills);
      const memberRole = (member.preferredRole || "").toLowerCase();
      const proficiency = member.proficiencyLevel || "Intermediate";
      const availableHours = member.availableHours || 20;
      const currentHours = memberWorkload[id] || 0;

      // 1. Skill overlap score
      let skillMatches = 0;
      taskRequiredSet.forEach((reqSkill) => {
        memberSkillsSet.forEach((memSkill) => {
          if (memSkill.includes(reqSkill) || reqSkill.includes(memSkill)) {
            skillMatches += 1;
          }
        });
      });

      // 2. Role alignment bonus
      let roleBonus = 0;
      if (task.moduleName.includes("API") || task.title.includes("Database") || task.title.includes("REST")) {
        if (memberRole.includes("backend") || memberRole.includes("full stack") || memberRole.includes("database")) roleBonus += 3;
      }
      if (task.moduleName.includes("UI") || task.title.includes("Frontend") || task.title.includes("Forms")) {
        if (memberRole.includes("frontend") || memberRole.includes("ui") || memberRole.includes("full stack")) roleBonus += 3;
      }

      // 3. Experience level suitability
      let experienceBonus = 1;
      if (task.priority === "Critical" && proficiency === "Advanced") experienceBonus += 2;
      if (proficiency === "Beginner" && task.priority === "Critical") experienceBonus -= 2;

      // 4. Workload balance penalty
      const remainingCapacity = Math.max(0, availableHours - currentHours);
      const loadPenalty = (currentHours / (availableHours || 1)) * 4;

      const totalScore = (skillMatches * 4) + roleBonus + experienceBonus + (remainingCapacity > task.estimatedHours ? 2 : -3) - loadPenalty;

      if (totalScore > highestScore) {
        highestScore = totalScore;
        bestMember = member;
      }
    });

    if (bestMember) {
      const bestId = String(bestMember.userId || bestMember._id || bestMember.name);
      memberWorkload[bestId] = (memberWorkload[bestId] || 0) + task.estimatedHours;

      const matchedSkills = (bestMember.technicalSkills || []).filter((s) =>
        taskRequiredSet.has(s.toLowerCase())
      );

      const hasDirectSkill = matchedSkills.length > 0;
      const learningPrereqs = [];
      if (!hasDirectSkill && task.skillsRequired.length > 0) {
        learningPrereqs.push(`Quick-start guide on ${task.skillsRequired[0]}`);
      }

      const assignmentReason = hasDirectSkill
        ? `Assigned to ${bestMember.name} based on skill match in ${matchedSkills.join(", ")}.`
        : `Assigned to ${bestMember.name} (${bestMember.preferredRole || "Developer"}) to balance team capacity.`;

      return {
        ...task,
        assignedTo: bestMember.userId || null,
        assignedMemberName: bestMember.name,
        assignmentReason,
        learningPrerequisites: learningPrereqs
      };
    }

    return {
      ...task,
      assignedTo: null,
      assignedMemberName: "Unassigned",
      assignmentReason: "Available capacity distributed evenly."
    };
  });
}

/**
 * Dependency-aware scheduling algorithm (Topological sort & hour calculations)
 */
function scheduleTasksWithDependencies(tasks, constraints, memberSnapshots) {
  const taskMap = {};
  tasks.forEach((t) => {
    taskMap[t.taskId] = { ...t, scheduledStartHour: 0, scheduledEndHour: 0 };
  });

  const memberAvailableHours = {};
  (memberSnapshots || []).forEach((m) => {
    const id = String(m.userId || m._id || m.name);
    memberAvailableHours[id] = 0;
  });

  let globalProjectHour = 0;
  let changed = true;
  let iterations = 0;
  const maxIterations = tasks.length * 3;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations += 1;

    tasks.forEach((task) => {
      const item = taskMap[task.taskId];
      let maxPrereqEndHour = 0;

      (item.dependencies || []).forEach((depId) => {
        if (taskMap[depId] && taskMap[depId].scheduledEndHour > maxPrereqEndHour) {
          maxPrereqEndHour = taskMap[depId].scheduledEndHour;
        }
      });

      const memberId = String(item.assignedTo || item.assignedMemberName);
      const memberFreeHour = memberAvailableHours[memberId] || 0;
      const proposedStart = Math.max(maxPrereqEndHour, memberFreeHour);
      const proposedEnd = proposedStart + (item.estimatedHours || 1);

      if (proposedStart !== item.scheduledStartHour || proposedEnd !== item.scheduledEndHour) {
        item.scheduledStartHour = proposedStart;
        item.scheduledEndHour = proposedEnd;
        memberAvailableHours[memberId] = proposedEnd;
        if (proposedEnd > globalProjectHour) {
          globalProjectHour = proposedEnd;
        }
        changed = true;
      }
    });
  }

  const scheduledTasks = tasks.map((t) => taskMap[t.taskId]);

  const milestones = [
    {
      name: "Phase 1: Foundation & Schemas",
      targetHour: Math.max(2, Math.round(globalProjectHour * 0.20)),
      type: "Setup",
      description: "Codebase setup, database schemas active, initial server running."
    },
    {
      name: "Phase 2: Core Business API",
      targetHour: Math.max(4, Math.round(globalProjectHour * 0.45)),
      type: "Feature Complete",
      description: "Backend controllers serving real domain JSON responses."
    },
    {
      name: "Phase 3: Interactive Dashboard UI",
      targetHour: Math.max(6, Math.round(globalProjectHour * 0.70)),
      type: "Feature Complete",
      description: "Frontend forms and status summary views styled."
    },
    {
      name: "Phase 4: Full-Stack Integration",
      targetHour: Math.max(8, Math.round(globalProjectHour * 0.88)),
      type: "Integration",
      description: "Frontend connected end-to-end to backend APIs."
    },
    {
      name: "Phase 5: Live Cloud Deployment",
      targetHour: globalProjectHour,
      type: "Deployment",
      description: "App live on public URL with seeded demo walkthrough records."
    }
  ];

  return {
    scheduledTasks,
    totalPlannedHours: globalProjectHour,
    milestones
  };
}

/**
 * Risk and feasibility assessment
 */
function assessRisksAndFeasibility(input, scheduledTasks, totalPlannedHours, memberSnapshots) {
  const { constraints } = input;
  const deadlineHours = constraints?.availableHoursTotal || 24;

  const risks = [];

  if (totalPlannedHours > deadlineHours) {
    risks.push({
      category: "Timeline/Deadline",
      description: `Planned duration (${totalPlannedHours} hrs) exceeds available time (${deadlineHours} hrs).`,
      severity: "High",
      mitigationStrategy: "Scope down secondary UI views. Focus strictly on the primary MVP flow."
    });
  } else if (totalPlannedHours > deadlineHours * 0.85) {
    risks.push({
      category: "Timeline/Deadline",
      description: `Schedule margin is tight (${Math.max(0, deadlineHours - totalPlannedHours)}h buffer remaining).`,
      severity: "Medium",
      mitigationStrategy: "Complete core API early to leave sufficient time for cloud deployment."
    });
  }

  const allTeamSkills = new Set();
  (memberSnapshots || []).forEach((m) => {
    (m.technicalSkills || []).forEach((s) => allTeamSkills.add(s.toLowerCase()));
  });

  const missingKeySkills = [];
  scheduledTasks.forEach((t) => {
    (t.skillsRequired || []).forEach((req) => {
      const lower = req.toLowerCase();
      const has = [...allTeamSkills].some((ts) => ts.includes(lower) || lower.includes(ts));
      if (!has && !missingKeySkills.includes(req)) {
        missingKeySkills.push(req);
      }
    });
  });

  if (missingKeySkills.length > 0) {
    risks.push({
      category: "Skills Gap",
      description: `Team lacks prior experience in: ${missingKeySkills.slice(0, 3).join(", ")}.`,
      severity: missingKeySkills.length > 2 ? "High" : "Medium",
      mitigationStrategy: "Pair on critical tasks and use standard boilerplates."
    });
  }

  let overallFeasibilityScore = "High Feasibility";
  if (totalPlannedHours > deadlineHours || risks.some((r) => r.severity === "High")) {
    overallFeasibilityScore = "High Risk / Tight Scope";
  } else if (totalPlannedHours > deadlineHours * 0.75) {
    overallFeasibilityScore = "Moderate Feasibility";
  }

  return {
    overallFeasibilityScore,
    scopeRecommendation: totalPlannedHours > deadlineHours
      ? "RECOMMENDATION: Focus exclusively on a working end-to-end MVP demo."
      : "RECOMMENDATION: Scope is well-balanced with team availability.",
    bufferHoursSuggested: Math.max(2, Math.round(deadlineHours * 0.15)),
    risks
  };
}

/**
 * Main Master Pipeline: Generates full PathFinder Plan
 */
function generatePathfinderPlan(input) {
  const { memberSnapshots } = input;
  const domain = detectDomainProfile(input.problemStatement, input.expectedOutcome, input.projectCategory);

  const problemAnalysis = generateProblemAnalysis(input);
  const architectureAndTech = recommendArchitectureAndTech(input, memberSnapshots);
  const modules = generateModules(input, architectureAndTech);
  const rawTasks = generateRawTasks(modules, input.title, domain);
  const allocatedTasks = allocateTasks(rawTasks, memberSnapshots);

  const { scheduledTasks, totalPlannedHours, milestones } = scheduleTasksWithDependencies(
    allocatedTasks,
    input.constraints,
    memberSnapshots
  );

  const risksAndFeasibility = assessRisksAndFeasibility(
    input,
    scheduledTasks,
    totalPlannedHours,
    memberSnapshots
  );

  return {
    problemAnalysis,
    architectureAndTech,
    modules,
    tasks: scheduledTasks,
    timelineMilestones: milestones,
    risksAndFeasibility
  };
}

/**
 * Dynamic Replanning Service
 */
function recalculatePlan(existingPlan, replanningInput) {
  const { updatedMemberAvailability, updatedDeadline, reason } = replanningInput;

  const currentTasks = existingPlan.tasks || [];
  const completedTaskIds = new Set(
    currentTasks.filter((t) => t.status === "Completed").map((t) => t.taskId)
  );

  const revisedTasks = currentTasks.map((t) => {
    const taskObj = t.toObject ? t.toObject() : { ...t };
    if (taskObj.status === "Completed") return taskObj;
    return {
      ...taskObj,
      blockerReason: taskObj.status === "Blocked" ? taskObj.blockerReason || "Reported blocker" : ""
    };
  });

  let memberSnapshots = existingPlan.teamMemberSnapshots || [];
  if (Array.isArray(updatedMemberAvailability)) {
    memberSnapshots = memberSnapshots.map((m) => {
      const match = updatedMemberAvailability.find((u) => String(u.userId) === String(m.userId));
      return match ? { ...m, availableHours: match.availableHours } : m;
    });
  }

  const existingConstraints = existingPlan.constraints || {};
  const constraints = {
    ...existingConstraints,
    finalDeadline: updatedDeadline ? new Date(updatedDeadline) : (existingConstraints.finalDeadline || new Date())
  };

  const uncompletedTasks = revisedTasks.filter((t) => t.status !== "Completed");
  uncompletedTasks.forEach((t) => {
    t.dependencies = (t.dependencies || []).filter((dep) => !completedTaskIds.has(dep));
  });

  const reallocated = allocateTasks(uncompletedTasks, memberSnapshots);

  const { scheduledTasks: rescheduledRemaining, totalPlannedHours, milestones } = scheduleTasksWithDependencies(
    reallocated,
    constraints,
    memberSnapshots
  );

  const finalTasks = [
    ...revisedTasks.filter((t) => t.status === "Completed"),
    ...rescheduledRemaining
  ];

  const risksAndFeasibility = assessRisksAndFeasibility(
    { ...existingPlan, constraints },
    finalTasks,
    totalPlannedHours,
    memberSnapshots
  );

  const revisionCount = (existingPlan.planHistory || []).length + 1;
  const historyEntry = {
    revisionNumber: revisionCount,
    recalculatedAt: new Date(),
    recalculationReason: reason || "Dynamic schedule re-optimization based on progress & availability updates.",
    summaryOfChanges: `Recalculated ${uncompletedTasks.length} remaining tasks. Preserved ${completedTaskIds.size} completed items. Total duration: ${totalPlannedHours}h.`
  };

  return {
    tasks: finalTasks,
    timelineMilestones: milestones,
    risksAndFeasibility,
    teamMemberSnapshots: memberSnapshots,
    constraints,
    historyEntry
  };
}

module.exports = {
  generatePathfinderPlan,
  recalculatePlan,
  evaluateStackSuitability,
  detectDomainProfile
};
