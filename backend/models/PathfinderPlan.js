const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  moduleName: {
    type: String,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  assignedMemberName: {
    type: String,
    default: "Unassigned"
  },
  assignmentReason: {
    type: String,
    default: ""
  },
  skillsRequired: [{
    type: String,
    trim: true
  }],
  learningPrerequisites: [{
    type: String,
    trim: true
  }],
  estimatedHours: {
    type: Number,
    required: true,
    default: 4
  },
  priority: {
    type: String,
    enum: ["Critical", "High", "Medium", "Low"],
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["Not Started", "In Progress", "Blocked", "Completed"],
    default: "Not Started"
  },
  dependencies: [{
    type: String // taskIds of prerequisites
  }],
  acceptanceCriteria: [{
    type: String
  }],
  blockerReason: {
    type: String,
    default: ""
  },
  scheduledStartHour: {
    type: Number,
    default: 0
  },
  scheduledEndHour: {
    type: Number,
    default: 0
  },
  completionDate: {
    type: Date,
    default: null
  }
}, { _id: true, timestamps: true });

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    default: ""
  },
  priority: {
    type: String,
    enum: ["Must Have", "Should Have", "Nice to Have"],
    default: "Must Have"
  },
  requiredTechnologies: [{
    type: String
  }],
  features: [{
    type: String
  }],
  implementationSequence: [{
    type: String
  }],
  firstStep: {
    type: String,
    default: ""
  },
  keyConcepts: [{
    type: String
  }],
  learningResources: [{
    title: String,
    url: String,
    notes: String
  }],
  testingInstructions: [{
    type: String
  }],
  commonPitfalls: [{
    type: String
  }],
  estimatedTotalHours: {
    type: Number,
    default: 0
  }
}, { _id: true });

const riskItemSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["Skills Gap", "Technology Complexity", "API/External Dependency", "Timeline/Deadline", "Scope/Feasibility"],
    default: "Technology Complexity"
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium"
  },
  mitigationStrategy: {
    type: String,
    required: true
  }
}, { _id: true });

const pathfinderPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  problemStatement: {
    type: String,
    required: true
  },
  expectedOutcome: {
    type: String,
    default: ""
  },
  targetUsers: {
    type: String,
    default: ""
  },
  projectCategory: {
    type: String,
    default: "Web Application"
  },
  mandatoryRequirements: [{
    type: String
  }],
  referenceLinks: [{
    type: String
  }],
  evaluationCriteria: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null
  },
  linkedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    default: null
  },
  planningMode: {
    type: String,
    enum: ["guide_from_scratch", "specified_stack"],
    default: "guide_from_scratch"
  },
  specifiedStack: {
    frontend: [{ type: String }],
    backend: [{ type: String }],
    database: [{ type: String }],
    programmingLanguages: [{ type: String }],
    frameworks: [{ type: String }],
    apisAndServices: [{ type: String }],
    aiMlTools: [{ type: String }],
    existingCodeOrDatasets: { type: String, default: "" }
  },
  teamMemberSnapshots: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    name: String,
    email: String,
    technicalSkills: [String],
    proficiencyLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate"
    },
    preferredRole: String,
    availableHours: {
      type: Number,
      default: 20
    },
    tasksInterestedIn: [String],
    willingToLearn: [String]
  }],
  constraints: {
    finalDeadline: {
      type: Date,
      required: true
    },
    timeZone: {
      type: String,
      default: "Asia/Kolkata"
    },
    projectType: {
      type: String,
      enum: ["24-hour hackathon", "36-hour hackathon", "48-hour hackathon", "1-week sprint", "2-week project", "semester-long"],
      default: "24-hour hackathon"
    },
    availableHoursTotal: {
      type: Number,
      default: 24
    },
    infrastructureLimits: {
      type: String,
      default: ""
    },
    mandatoryFeatures: [String],
    optionalFeatures: [String],
    deploymentRequirements: {
      type: String,
      default: ""
    },
    demoPresentationTime: {
      type: Date,
      default: null
    }
  },
  problemAnalysis: {
    simplifiedExplanation: String,
    mainObjectives: [String],
    functionalRequirements: [String],
    nonFunctionalRequirements: [String],
    majorTechnicalChallenges: [String],
    assumptionsAndUnknowns: [String],
    successCriteria: [String]
  },
  architectureAndTech: {
    recommendedArchitecture: String,
    frontendTech: [String],
    backendTech: [String],
    databaseTech: [String],
    apisAndLibraries: [String],
    mainModulesOverview: [String],
    dataFlowSummary: String,
    deploymentApproach: String,
    selectionRationale: String,
    stackIncompatibilitiesWarning: String
  },
  modules: [moduleSchema],
  tasks: [taskSchema],
  timelineMilestones: [{
    name: String,
    targetHour: Number,
    targetDate: Date,
    type: {
      type: String,
      enum: ["Setup", "Feature Complete", "Integration", "Testing", "Deployment", "Demo Prep"],
      default: "Feature Complete"
    },
    description: String
  }],
  risksAndFeasibility: {
    overallFeasibilityScore: {
      type: String,
      enum: ["High Feasibility", "Moderate Feasibility", "High Risk / Tight Scope"],
      default: "High Feasibility"
    },
    scopeRecommendation: String,
    bufferHoursSuggested: Number,
    risks: [riskItemSchema]
  },
  planHistory: [{
    revisionNumber: Number,
    recalculatedAt: {
      type: Date,
      default: Date.now
    },
    recalculationReason: String,
    summaryOfChanges: String
  }],
  generationMetadata: {
    usedAIProvider: {
      type: Boolean,
      default: false
    },
    aiModelName: {
      type: String,
      default: "rule_based_engine"
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("PathfinderPlan", pathfinderPlanSchema);
