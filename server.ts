import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Heuristics for token estimations (similar to tiktoken style but safe for standard node)
function estimateTokens(text: string): number {
  return Math.ceil((text || "").length / 3.8);
}

// ----------------------------------------------------
// API Route: Multi-Agent Cooking Orchestrator Route
// ----------------------------------------------------
app.post("/api/orchestrate", async (req, res): Promise<any> => {
  const { routine, budget, allergies, servings } = req.body;

  if (!routine) {
    return res.status(400).json({ error: "Daily routine input is required." });
  }

  const targetBudget = Number(budget) || 500.0;
  const targetServings = Number(servings) || 1;
  const userAllergies = Array.isArray(allergies) ? allergies.join(", ") : (allergies || "None");

  try {
    const ai = getGeminiClient();
    const startTime = Date.now();

    // Setup logs and tracing state
    const logs: Array<{
      agent: string;
      message: string;
      timestamp: string;
      level: "info" | "success" | "warning";
    }> = [];

    const addLog = (agent: string, message: string, level: "info" | "success" | "warning" = "info") => {
      logs.push({
        agent,
        message,
        timestamp: new Date().toLocaleTimeString(),
        level,
      });
    };

    // --- AGENT 1: ROUTINE ANALYZER AGENT ---
    addLog("System Coordinator", "Bootstrap multi-agent session. Spawning [Routine Analyzer Agent]...", "info");
    
    const routineAnalyzerPrompt = `
      You are the Routine Analyzer Agent of CookFlow.
      Analyze the following user's daily routine and dietary constraints:
      User Daily Routine: "${routine}"
      Dietary restrictions/allergies: "${userAllergies}"
      
      Determine logical cooking time windows (in minutes) for Breakfast, Lunch, and Dinner.
      Estimate caloric / energy budget (Options: "Low", "Medium", "High") based on activity levels detected in the routine.
      Summarize the daily rhythm list and cooking constraints.

      Respond STRICTLY in the following JSON format:
      {
        "cookingWindows": {
          "breakfastMinutes": number,
          "lunchMinutes": number,
          "dinnerMinutes": number
        },
        "energyNeed": "Low" | "Medium" | "High",
        "routineSummary": "short summary of the daily routine",
        "constraints": ["constraint 1", "constraint 2", ...]
      }
    `;

    addLog("Routine Analyzer Agent", "Parsing daily schedule blocks for physical cooking windows...", "info");
    const analyzerStart = Date.now();
    const analyzerResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: routineAnalyzerPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });
    const analyzerDuration = Date.now() - analyzerStart;
    const analyzerText = analyzerResponse.text || "{}";
    const analyzerOutput = JSON.parse(analyzerText);
    
    addLog("Routine Analyzer Agent", `Extracted constraints. Cooking time quotas: Breakfast: ${analyzerOutput.cookingWindows?.breakfastMinutes}m, Lunch: ${analyzerOutput.cookingWindows?.lunchMinutes}m, Dinner: ${analyzerOutput.cookingWindows?.dinnerMinutes}m`, "success");

    // --- AGENT 2: MEAL PLANNER AGENT ---
    addLog("System Coordinator", "Passing constraints to [Meal Planner Agent]...", "info");
    const mealPlannerPrompt = `
      You are the Meal Planner Agent of CookFlow.
      Using the constraints parsed by the Routine Analyzer, design a 3-meal plan (Breakfast, Lunch, Dinner).
      Each meal MUST fit into the allocated prep time limit and should serve ${targetServings} person(s).
      Align with dietary requirements if provided: "${userAllergies}".

      Time windows:
      - Breakfast prep time limit: ${analyzerOutput.cookingWindows?.breakfastMinutes} minutes
      - Lunch prep time limit: ${analyzerOutput.cookingWindows?.lunchMinutes} minutes
      - Dinner prep time limit: ${analyzerOutput.cookingWindows?.dinnerMinutes} minutes

      Format your output food items with names, descriptions, actual prepTimes (must not exceed limits), a 'macros' object detailing macronutrients (calories as a number, protein in grams as a number, carbs in grams as a number, fat in grams as a number), list of ingredients (with name and raw amount, e.g. "2 eggs", "100g spinach"), and simple step guidelines.

      Respond STRICTLY in the following JSON format:
      {
        "breakfast": {
          "name": "string",
          "description": "string",
          "prepTime": number,
          "macros": {
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number
          },
          "ingredients": [
            {"name": "ingredient name", "amount": "string"},
            ...
          ],
          "steps": ["step 1", "step 2"]
        },
        "lunch": {
          "name": "string",
          "description": "string",
          "prepTime": number,
          "macros": {
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number
          },
          "ingredients": [
            {"name": "ingredient name", "amount": "string"},
            ...
          ],
          "steps": ["step 1", "step 2"]
        },
        "dinner": {
          "name": "string",
          "description": "string",
          "prepTime": number,
          "macros": {
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number
          },
          "ingredients": [
            {"name": "ingredient name", "amount": "string"},
            ...
          ],
          "steps": ["step 1", "step 2"]
        }
      }
    `;

    addLog("Meal Planner Agent", `Developing 3 recipes customized for active schedule & ${targetServings} servings...`, "info");
    const plannerStart = Date.now();
    const plannerResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: mealPlannerPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });
    const plannerDuration = Date.now() - plannerStart;
    const plannerText = plannerResponse.text || "{}";
    const plannerOutput = JSON.parse(plannerText);
    
    addLog("Meal Planner Agent", `Successfully compiled customized menu: [${plannerOutput.breakfast?.name}], [${plannerOutput.lunch?.name}], [${plannerOutput.dinner?.name}]`, "success");

    // --- AGENT 3: BUDGET & GROCERY AGENT ---
    addLog("System Coordinator", "Handing off ingredients list to [Budget & Grocery Agent]...", "info");
    const allIngredientsList = [
      ...(plannerOutput.breakfast?.ingredients || []).map((i: any) => ({ ...i, meal: "Breakfast" })),
      ...(plannerOutput.lunch?.ingredients || []).map((i: any) => ({ ...i, meal: "Lunch" })),
      ...(plannerOutput.dinner?.ingredients || []).map((i: any) => ({ ...i, meal: "Dinner" })),
    ];

    const budgetPrompt = `
      You are the Budget & Grocery Agent of CookFlow.
      Compile a consolidated, neatly categorized grocery list from the raw ingredient list provided.
      The user target budget is INR ₹${targetBudget.toFixed(2)}.

      Ingredients to compile:
      ${JSON.stringify(allIngredientsList)}

      Tasks:
      1. Group identical items and combine their amounts logically.
      2. Group them by standard grocery store categories (e.g. "Produce", "Pantry", "Dairy & Eggs", "Proteins", "Bakery").
      3. Assign an estimated realistic shelf-price (in Indian Rupees - INR ₹) for each consolidated item for standard Indian kitchen retail quantities (e.g., loose or packaged rates from BigBasket/local Mandi).
      4. Sum up the total estimated cost in INR (₹).
      5. Check if the total exceeds the user budget (INR ₹${targetBudget.toFixed(2)}).
         *If it exceeds*, execute a "Cost Reduction" logic sub-loop: flag high-cost items, suggest budget-conscious optimizations (e.g. using local brands, organic alternative cuts, switching premium brands to loose commodities, loose grains, local vegetables), and calculate a lowered "optimizedCost" for those items and update the total cost dynamically. Detail specifically what actions were taken for cost reduction.

      Respond STRICTLY in the following JSON format:
      {
        "groceryList": [
          {
            "name": "ingredient identifier (e.g. Fresh Paneer or Tomatoes)",
            "category": "Produce" | "Pantry" | "Dairy & Eggs" | "Proteins" | "Bakery" | "Other",
            "quantity": "total aggregated string amount",
            "estimatedUnitCost": number,
            "totalItemCost": number,
            "meals": ["Breakfast", "Lunch", "Dinner"]
          },
          ...
        ],
        "originalTotalCost": number,
        "isExceeded": boolean,
        "costReductionApplied": boolean,
        "optimizedTotalCost": number,
        "savingsDetails": {
          "itemsOptimized": [
            {
              "itemName": "string",
              "actionTaken": "how cost was reduced",
              "originalPrice": number,
              "newPrice": number
            }
          ],
          "savingsAchieved": number,
          "budgetAdvice": "string"
        }
      }
    `;

    addLog("Budget & Grocery Agent", `Consolidating ingredients and looking up national utility average pricing...`, "info");
    const budgetStart = Date.now();
    const budgetResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: budgetPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });
    const budgetDuration = Date.now() - budgetStart;
    const budgetText = budgetResponse.text || "{}";
    const budgetOutput = JSON.parse(budgetText);

    if (budgetOutput.isExceeded) {
      addLog("Budget & Grocery Agent", `Budget Exceeded! Target: ₹${targetBudget.toFixed(2)}, Est Total: ₹${budgetOutput.originalTotalCost.toFixed(2)}. Triggering Cost-Reduction loop...`, "warning");
      addLog("Budget & Grocery Agent", `Completed sub-loop optimization! Saved ₹${(budgetOutput.savingsDetails?.savingsAchieved || 0).toFixed(2)}. New optimized total: ₹${(budgetOutput.optimizedTotalCost || budgetOutput.originalTotalCost).toFixed(2)}`, "success");
    } else {
      addLog("Budget & Grocery Agent", `Grocery list fits standard estimate! Est Total: ₹${budgetOutput.originalTotalCost.toFixed(2)} inside target of ₹${targetBudget.toFixed(2)}.`, "success");
    }

    // --- AGENT 4: SUBSTITUTION AGENT ---
    addLog("System Coordinator", "Dispatching list to [Substitution Agent]...", "info");
    const subPrompt = `
      You are the Substitution Agent of CookFlow.
      Analyze the finalized ingredients list:
      ${JSON.stringify(budgetOutput.groceryList)}
      
      Look for potential allergens (like gluten, dairy, nuts, shellfish), high-cost specialty items, or common ingredients people might not have in their kitchen.
      Provide smart culinary substitutions to maximize kitchen accessibility, health, or cost efficiency.

      Respond STRICTLY in the following JSON format:
      {
        "substitutions": [
          {
            "originalItem": "string",
            "substitutedWith": "string",
            "reasonType": "Cost Saving" | "Allergy Friendly" | "Dietary Swap" | "Staple Alternative",
            "culinaryBenefit": "explanation of how this works culinary-wise"
          },
          ...
        ]
      }
    `;

    addLog("Substitution Agent", `Scouting substitutions for potential allergy, pantry-staple accessibility and extra cost savers...`, "info");
    const subStart = Date.now();
    const subResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: subPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });
    const subDuration = Date.now() - subStart;
    const subText = subResponse.text || "{}";
    const subOutput = JSON.parse(subText);
    
    addLog("Substitution Agent", `Dispatched ${subOutput.substitutions?.length || 0} modular swaps to boost cook versatility.`, "success");

    // --- WRAP UP AND METRICS CALCULATOR ---
    addLog("System Coordinator", "Flow cycle finished. Orchestration completed successfully. Publishing dashboard data stream...", "success");

    const totalDuration = Date.now() - startTime;

    // Estimate accurate token counts based on input/output lengths of prompts & responses
    const analyzerInputTokens = estimateTokens(routineAnalyzerPrompt);
    const analyzerOutputTokens = estimateTokens(analyzerText);
    const plannerInputTokens = estimateTokens(mealPlannerPrompt);
    const plannerOutputTokens = estimateTokens(plannerText);
    const budgetInputTokens = estimateTokens(budgetPrompt);
    const budgetOutputTokens = estimateTokens(budgetText);
    const subInputTokens = estimateTokens(subPrompt);
    const subOutputTokens = estimateTokens(subText);

    const totalInputTokens = analyzerInputTokens + plannerInputTokens + budgetInputTokens + subInputTokens;
    const totalOutputTokens = analyzerOutputTokens + plannerOutputTokens + budgetOutputTokens + subOutputTokens;

    // Calculate simulated cost (Gemini 3.5 Flash Rates: $0.000075 / 1K Input, $0.00030 / 1K Output)
    const estimatedCostUsd = ((totalInputTokens / 1000) * 0.000075) + ((totalOutputTokens / 1000) * 0.00030);

    const agentMetrics = {
      analyzer: { durationMs: analyzerDuration, inputTokens: analyzerInputTokens, outputTokens: analyzerOutputTokens },
      planner: { durationMs: plannerDuration, inputTokens: plannerInputTokens, outputTokens: plannerOutputTokens },
      budget: { durationMs: budgetDuration, inputTokens: budgetInputTokens, outputTokens: budgetOutputTokens },
      subs: { durationMs: subDuration, inputTokens: subInputTokens, outputTokens: subOutputTokens },
    };

    res.json({
      success: true,
      data: {
        routineAnalysis: analyzerOutput,
        mealPlan: plannerOutput,
        budgetAndGroceries: budgetOutput,
        substitutionsList: subOutput.substitutions || [],
        orchestrationLogs: logs,
        metrics: {
          totalDurationMs: totalDuration,
          totalInputTokens,
          totalOutputTokens,
          totalTokens: totalInputTokens + totalOutputTokens,
          estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
          agentDetails: agentMetrics,
        }
      }
    });

  } catch (error: any) {
    console.error("Orchestration failed:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An exception occurred inside the orchestration system."
    });
  }
});

// ----------------------------------------------------
// Mounting Vite Server Middleware
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CookFlow Fullstack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
