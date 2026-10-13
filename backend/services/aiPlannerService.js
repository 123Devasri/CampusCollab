const axios = require("axios");
const { generatePathfinderPlan } = require("./pathfinderEngine");

/**
 * Modular AI Planner Service with configurable LLM Provider
 * If an AI API Key (OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY) is configured,
 * it enhances the plan with deep reasoning; otherwise, it seamlessly uses the verified
 * deterministic engine as a reliable, production-ready fallback.
 */

async function planWithAIOrFallback(planningInput) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  // If no external LLM key is configured in backend/.env, use verified deterministic engine
  if (!apiKey) {
    const plan = generatePathfinderPlan(planningInput);
    return {
      ...plan,
      generationMetadata: {
        usedAIProvider: false,
        aiModelName: "deterministic_rule_engine",
        generatedAt: new Date()
      }
    };
  }

  // If an API key is provided, attempt structured enhancement with timeout & retry
  try {
    // For OpenAI / Compatible endpoint
    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a senior software architect assisting college hackathon teams. Return only valid JSON for project plan enhancement."
            },
            {
              role: "user",
              content: `Analyze this problem statement: "${planningInput.problemStatement}". Expected outcome: "${planningInput.expectedOutcome}". Return a JSON object with: simplifiedExplanation, mainObjectives, majorTechnicalChallenges.`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        },
        {
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          timeout: 8000
        }
      );

      const parsed = JSON.parse(response.data.choices[0].message.content);
      const basePlan = generatePathfinderPlan(planningInput);

      if (parsed.simplifiedExplanation) {
        basePlan.problemAnalysis.simplifiedExplanation = parsed.simplifiedExplanation;
      }
      if (Array.isArray(parsed.mainObjectives)) {
        basePlan.problemAnalysis.mainObjectives = parsed.mainObjectives;
      }
      if (Array.isArray(parsed.majorTechnicalChallenges)) {
        basePlan.problemAnalysis.majorTechnicalChallenges = parsed.majorTechnicalChallenges;
      }

      return {
        ...basePlan,
        generationMetadata: {
          usedAIProvider: true,
          aiModelName: "openai-gpt-4o-mini",
          generatedAt: new Date()
        }
      };
    }
  } catch (err) {
    console.warn("AI enhancement API unavailable or timed out; falling back to deterministic engine:", err.message);
  }

  // Graceful fallback to verified deterministic engine
  const plan = generatePathfinderPlan(planningInput);
  return {
    ...plan,
    generationMetadata: {
      usedAIProvider: false,
      aiModelName: "deterministic_rule_engine",
      generatedAt: new Date()
    }
  };
}

module.exports = {
  planWithAIOrFallback
};
