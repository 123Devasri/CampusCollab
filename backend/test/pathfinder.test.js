const assert = require("assert");
const { generatePathfinderPlan, recalculatePlan, evaluateStackSuitability } = require("../services/pathfinderEngine");

console.log("=========================================");
console.log(" RUNNING PATHFINDER ENGINE UNIT TESTS    ");
console.log("=========================================");

// Test 1: Problem statement validation & requirements extraction
console.log("\n[Test 1] Testing problem statement decomposition...");
const mockInputModeA = {
  title: "AI Campus Safety Alert",
  problemStatement: "College campuses face delays in reporting emergencies and coordinating security guards and medical responders in real time.",
  expectedOutcome: "A real-time emergency broadcast dashboard with automated SMS and map dispatching.",
  targetUsers: "Campus security, students, and emergency wardens",
  projectCategory: "Web Application",
  mandatoryRequirements: ["Live map dispatch", "Under 2-second alert latency"],
  planningMode: "guide_from_scratch",
  memberSnapshots: [
    {
      userId: "user_1",
      name: "Aarav Sharma",
      technicalSkills: ["React", "JavaScript", "HTML/CSS"],
      proficiencyLevel: "Intermediate",
      preferredRole: "Frontend Developer",
      availableHours: 20
    },
    {
      userId: "user_2",
      name: "Pooja Patel",
      technicalSkills: ["Node.js", "Express", "MongoDB", "Python"],
      proficiencyLevel: "Advanced",
      preferredRole: "Backend Developer",
      availableHours: 24
    }
  ],
  constraints: {
    finalDeadline: new Date(Date.now() + 24 * 3600 * 1000),
    projectType: "24-hour hackathon",
    availableHoursTotal: 24
  }
};

const planA = generatePathfinderPlan(mockInputModeA);

assert(planA.problemAnalysis, "Problem analysis should be generated");
assert(planA.problemAnalysis.mainObjectives.length > 0, "Objectives should be extracted");
assert(planA.modules.length >= 4, "Should generate at least 4 modules");
assert(planA.tasks.length >= 8, "Should generate comprehensive task breakdown");
console.log("[PASS] Problem analysis & module breakdown validated.");

// Test 2: Mode B - Technology stack preservation & compatibility
console.log("\n[Test 2] Testing Mode B technology stack preservation...");
const mockInputModeB = {
  ...mockInputModeA,
  planningMode: "specified_stack",
  specifiedStack: {
    frontend: ["Next.js", "Tailwind CSS"],
    backend: ["FastAPI", "Python"],
    database: ["PostgreSQL"],
    frameworks: ["Pydantic"]
  }
};

const planB = generatePathfinderPlan(mockInputModeB);
assert(planB.architectureAndTech.frontendTech.includes("Next.js"), "Should preserve specified frontend");
assert(planB.architectureAndTech.backendTech.includes("FastAPI"), "Should preserve specified backend");
assert(planB.architectureAndTech.databaseTech.includes("PostgreSQL"), "Should preserve specified database");
console.log("[PASS] Technology stack preferences preserved accurately.");

// Test 3: Intelligent skill-based task allocation & experience constraints
console.log("\n[Test 3] Testing skill-based task allocation...");
const frontendTask = planA.tasks.find((t) => t.title.includes("Frontend") || t.title.includes("Forms"));
const backendTask = planA.tasks.find((t) => t.title.includes("Database") || t.title.includes("Backend"));

assert(frontendTask, "Frontend task should exist");
assert(backendTask, "Backend task should exist");
assert.strictEqual(frontendTask.assignedMemberName, "Aarav Sharma", "Frontend task should be assigned to Aarav");
assert.strictEqual(backendTask.assignedMemberName, "Pooja Patel", "Backend task should be assigned to Pooja");
console.log("[PASS] Tasks correctly allocated according to member skills & roles.");

// Test 4: Dependency-aware scheduling (Topological order)
console.log("\n[Test 4] Testing dependency-aware scheduling order...");
planA.tasks.forEach((task) => {
  if (task.dependencies && task.dependencies.length > 0) {
    task.dependencies.forEach((depId) => {
      const depTask = planA.tasks.find((t) => t.taskId === depId);
      if (depTask) {
        assert(
          task.scheduledStartHour >= depTask.scheduledEndHour,
          `Task ${task.taskId} started at hour ${task.scheduledStartHour} before prereq ${depId} finished at hour ${depTask.scheduledEndHour}`
        );
      }
    });
  }
});
console.log("[PASS] All task start times strictly respect prerequisite completion times.");

// Test 5: Dynamic replanning & preserving completed work
console.log("\n[Test 5] Testing dynamic replanning with preserved completed work...");
// Mark first two tasks completed
planA.tasks[0].status = "Completed";
planA.tasks[1].status = "Completed";

const replanned = recalculatePlan(planA, {
  reason: "Member Pooja Patel unavailable for 6 hours; deadline tightened.",
  updatedMemberAvailability: [
    { userId: "user_1", availableHours: 20 },
    { userId: "user_2", availableHours: 12 }
  ]
});

assert.strictEqual(replanned.tasks.filter((t) => t.status === "Completed").length, 2, "Completed tasks must remain completed");
assert(replanned.historyEntry, "History entry must be appended");
console.log("[PASS] Dynamic replanning preserves completed progress while redistributing remaining load.");

console.log("\n=========================================");
console.log(" ALL PATHFINDER UNIT TESTS PASSED!       ");
console.log("=========================================\n");
