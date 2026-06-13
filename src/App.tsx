import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, 
  Clock, 
  Coins, 
  Users, 
  CheckSquare, 
  RefreshCw, 
  ChefHat, 
  ChevronRight, 
  AlertTriangle, 
  ShoppingBag, 
  Sparkles, 
  ArrowRightLeft, 
  Receipt, 
  Cpu, 
  Info,
  CheckCircle2,
  Hourglass,
  Sliders,
  Flame,
  LayoutDashboard,
  UtensilsCrossed,
  Bell,
  Scale,
  Activity,
  Maximize2,
  Timer,
  Play,
  RotateCcw,
  Sparkle,
  XCircle,
  HelpCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Local Indian Culinary Presets in Indian Rupees (₹)
const INDIAN_PRESETS = [
  {
    label: "🚇 Mumbai local commuter",
    routine: "Morning fast train at 8 AM. Need 10-min breakfast (e.g. Kanda Poha), 15-min packed tiffin lunch (e.g. Roti with Sukhi Bhaji), and a nutritious 20-min dinner limit upon return. Pure veg lifestyle.",
    budget: 300,
    allergies: "Pure vegetarian",
    servings: 2,
    pantryAverages: "Mumbai Mandi"
  },
  {
    label: "🎓 Hostel Student in Bangalore",
    routine: "Morning lectures at IISc, hungry by 1 PM. Evening project sessions. Looking for budget meal shortcuts: Lemon Rice, high-protein Egg Bhurji, and Aloo Parathas. Minimal utensils, no oven.",
    budget: 150,
    allergies: "Nuts (Peanut allergen safety warning)",
    servings: 1,
    pantryAverages: "Vidyaranyapura local grocery"
  },
  {
    label: "💻 Delhi WFH Software Family",
    routine: "Work from home standups. Kids attend virtual school. Need healthy gluten-free millet recipes, rich Palak Paneer or light Chicken Curry, and standard snacks. Moderate budget, focused on low carb.",
    budget: 850,
    allergies: "Gluten-Free, Dairy-Free (Use coconut milk/mustard oil swaps)",
    servings: 4,
    pantryAverages: "Delhi Supermarket Delivery"
  },
  {
    label: "🥘 Slow Cooking Sunday Chef",
    routine: "Abundant weekend freedom. Slow cooking Dum Biryani or Rich Malai Kofta, handmade rotis. Ample prep minutes (up to 60 mins). High protein luxury with cardamom scent.",
    budget: 1200,
    allergies: "None",
    servings: 6,
    pantryAverages: "Premium Spices Bazaar"
  }
];

// Custom Toast notification structure to fulfill "in the warning also use toasters also to notify anything"
interface CulinaryToast {
  id: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  agent?: string;
}

export default function App() {
  // Input Settings (INR Localized)
  const [routine, setRoutine] = useState(INDIAN_PRESETS[0].routine);
  const [budget, setBudget] = useState(INDIAN_PRESETS[0].budget);
  const [allergies, setAllergies] = useState(INDIAN_PRESETS[0].allergies);
  const [servings, setServings] = useState(INDIAN_PRESETS[0].servings);
  const [pantryAverages, setPantryAverages] = useState(INDIAN_PRESETS[0].pantryAverages);

  // Layout Screens / Tabs ("crm sidebar navigation style")
  const [activeScreen, setActiveScreen] = useState<"dashboard" | "scheduler" | "kitchen-board" | "grocery" | "substitutions" | "budget-ledger" | "trace">("dashboard");

  // Multi-Agent states
  const [isLoading, setIsLoading] = useState(false);
  const [progressStage, setProgressStage] = useState<"idle" | "analyzer" | "planner" | "budget" | "subs" | "completed">("idle");
  const [orchestrationResult, setOrchestrationResult] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Simulated live running metrics
  const [liveTokens, setLiveTokens] = useState(0);
  const [liveCostInr, setLiveCostInr] = useState(0);
  const [liveCpuMetrics, setLiveCpuMetrics] = useState(0);
  const [liveTimeMs, setLiveTimeMs] = useState(0);

  // Live Terminal Logs trace
  const [logs, setLogs] = useState<any[]>([]);
  const [currentProgressRatio, setCurrentProgressRatio] = useState(0);

  // Kitchen Interactive Checklist & Cooking state
  const [checkedRecipeSteps, setCheckedRecipeSteps] = useState<Record<string, boolean>>({});
  const [checkedGroceries, setCheckedGroceries] = useState<Record<string, boolean>>({});
  
  // Floating Toasters Queue
  const [toasts, setToasts] = useState<CulinaryToast[]>([]);

  // Kitchen timer tool (Built-in active alarm widget for real prep focus)
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes default
  const [timerActive, setTimerActive] = useState(false);
  const [timerLabel, setTimerLabel] = useState("Breakfast prep alert");
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timers and logs simulation intervals
  const logTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cpuTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Toast dispatch utility
  const addToast = (message: string, type: "success" | "warning" | "error" | "info", agent?: string) => {
    const freshToast: CulinaryToast = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
      agent
    };
    setToasts((prev) => [freshToast, ...prev].slice(0, 5)); // Keep last 5 toasts
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cooking Timer logic
  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            addToast(`⏰ Culinary Alert: '${timerLabel}' cooking time target completed! Check pan heat.`, "warning", "Kitchen Alarm");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive, timerLabel]);

  const triggerTimerCountdown = (minutes: number, label: string) => {
    setTimerSeconds(minutes * 60);
    setTimerLabel(label);
    setTimerActive(true);
    addToast(`⏳ Dynamic cooking timer loaded: ${minutes} minutes for ${label}`, "info", "Kitchen Control");
    setActiveScreen("kitchen-board");
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  // Custom preset loader
  const handleApplyPreset = (preset: typeof INDIAN_PRESETS[0]) => {
    setRoutine(preset.routine);
    setBudget(preset.budget);
    setAllergies(preset.allergies);
    setServings(preset.servings);
    setPantryAverages(preset.pantryAverages);
    setErrorDetails(null);
    addToast(`Preset '${preset.label}' loaded into Chef workspace!`, "success", "CRM Workspace");
  };

  // Launch Orchestration Client Flow with full Exception Boundaries
  const handleOrchestrate = async () => {
    if (!routine.trim()) {
      addToast("Please key in your day schedule details so our agents can organize meals.", "warning", "System Validator");
      return;
    }

    setIsLoading(true);
    setErrorDetails(null);
    setOrchestrationResult(null);
    setLogs([]);
    setLiveTokens(0);
    setLiveCostInr(0);
    setProgressStage("analyzer");
    setActiveScreen("trace"); // Direct user to terminal to see live prompt loops
    
    addToast("Initiating Multi-Agent Cooking workflows...", "success", "System Coordinator");

    // Start active CPU Load visual ticks
    cpuTimerRef.current = setInterval(() => {
      setLiveCpuMetrics(Math.floor(Math.random() * 32) + 55); // Spikes between 55% and 87%
    }, 700);

    const callStartTime = Date.now();

    try {
      const response = await fetch("/api/orchestrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routine,
          budget,
          allergies: allergies.trim() === "None" ? "" : allergies,
          servings
        }),
      });

      // Capture HTTP exception levels
      if (!response.ok) {
        throw new Error(`Server returned fatal network error status: ${response.status}. Please check your Gemini key permissions.`);
      }

      const json = await response.json();

      if (!json.success || !json.data) {
        throw new Error(json.error || "AI pipeline exception: Failed to process routine matrices.");
      }

      const payload = json.data;
      const orchestrationLogs = payload.orchestrationLogs || [];
      
      let index = 0;
      const typewriteLogs = () => {
        if (index < orchestrationLogs.length) {
          const currentLog = orchestrationLogs[index];
          setLogs((prev) => [...prev, currentLog]);
          
          // Render progress state updates based on which agent finished
          const agentName = currentLog.agent.toLowerCase();
          
          if (agentName.includes("coordinator")) {
            // Keep steady
          } else if (agentName.includes("analyzer")) {
            setProgressStage("analyzer");
            addToast("Routine Analyzer compiled times & caloric limits.", "info", "Routine Analyzer Agent");
          } else if (agentName.includes("planner")) {
            setProgressStage("planner");
            addToast(`Menu designed: ${payload.mealPlan?.breakfast?.name || "Breakfast item"} and more.`, "success", "Meal Planner Agent");
          } else if (agentName.includes("budget")) {
            setProgressStage("budget");
            if (payload.budgetAndGroceries?.isExceeded) {
              addToast(`⚠️ Kitchen Budget of ₹${budget} exceeded! Triggering optimization loop...`, "warning", "Budget & Grocery Agent");
            } else {
              addToast(`✅ Menu ingredients are well within target of ₹${budget}!`, "success", "Budget & Grocery Agent");
            }
          } else if (agentName.includes("substitution")) {
            setProgressStage("subs");
            addToast("Dispatched healthy pantry substitutions.", "info", "Substitution Agent");
          }

          // Dynamic metric countdowns
          const maxTokens = payload.metrics?.totalTokens || 2400;
          const ratio = (index + 1) / orchestrationLogs.length;
          setCurrentProgressRatio(ratio);
          setLiveTokens(Math.floor(maxTokens * ratio));
          setLiveCostInr(Number((payload.metrics?.estimatedCostUsd * 83.5 * ratio).toFixed(4))); // Represent approximate INR cost derived from USD
          setLiveTimeMs(Math.floor((Date.now() - callStartTime)));

          index++;
          logTimerRef.current = setTimeout(typewriteLogs, 650);
        } else {
          // Finished typewriter rendering
          setProgressStage("completed");
          setIsLoading(false);
          setOrchestrationResult(payload);
          setLiveTokens(payload.metrics?.totalTokens || 0);
          setLiveTimeMs(payload.metrics?.totalDurationMs || (Date.now() - callStartTime));
          setLiveCostInr(Number((payload.metrics?.estimatedCostUsd * 83.5).toFixed(4)));
          
          setCheckedRecipeSteps({});
          setCheckedGroceries({});
          
          // Navigate to main Chef Dashboard on completion
          setActiveScreen("dashboard");
          addToast("🍳 Daily Cooking CRM Plan loaded! Your kitchen is prepped.", "success", "Chef Coordinator");

          if (cpuTimerRef.current) clearInterval(cpuTimerRef.current);
          setLiveCpuMetrics(0);
        }
      };

      typewriteLogs();

    } catch (e: any) {
      console.error(e);
      setErrorDetails(e.message || "Unknown error encountered while running cooking multi-agent pipeline.");
      setIsLoading(false);
      setProgressStage("idle");
      addToast("Failed to compile culinary session. See error alert details.", "error", "Fatal Crash");
      if (cpuTimerRef.current) clearInterval(cpuTimerRef.current);
    }
  };

  // Derived dashboard progress stats
  const totalGroceriesCount = orchestrationResult?.budgetAndGroceries?.groceryList?.length || 0;
  const tickedGroceriesCount = Object.values(checkedGroceries).filter(Boolean).length;
  
  const estimatedOriginalSum = orchestrationResult?.budgetAndGroceries?.originalTotalCost || 0;
  const estimatedOptimizedSum = orchestrationResult?.budgetAndGroceries?.optimizedTotalCost || estimatedOriginalSum;
  
  const totalCookingMinutesTarget = 
    (orchestrationResult?.routineAnalysis?.cookingWindows?.breakfastMinutes || 15) +
    (orchestrationResult?.routineAnalysis?.cookingWindows?.lunchMinutes || 15) +
    (orchestrationResult?.routineAnalysis?.cookingWindows?.dinnerMinutes || 30);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2c302d] font-sans antialiased flex flex-col selection:bg-sage-100 selection:text-sage-800">
      
      {/* PROFESSIONAL CHEF TOAST NOTIFICATIONS ("in the warning also use toasters also to notify anything") */}
      <div className="fixed bottom-5 right-5 z-50 pointer-events-none flex flex-col gap-2 max-w-sm w-full font-sans">
        <AnimatePresence>
          {toasts.map((t) => {
            let icon = <Info className="w-5 h-5 text-blue-500" />;
            let borderStyle = "border-sky-200 bg-sky-50";
            if (t.type === "success") {
              icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
              borderStyle = "border-emerald-200 bg-emerald-50";
            } else if (t.type === "warning") {
              icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
              borderStyle = "border-amber-200 bg-amber-50";
            } else if (t.type === "error") {
              icon = <XCircle className="w-5 h-5 text-rose-600" />;
              borderStyle = "border-rose-200 bg-[#fdf2f2]";
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className={`p-4 rounded-xl border pointer-events-auto shadow-md flex items-start gap-3 transition-all ${borderStyle}`}
              >
                <div className="shrink-0 pt-0.5">{icon}</div>
                <div className="flex-1">
                  {t.agent && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-800/60 block mb-0.5">
                      {t.agent}
                    </span>
                  )}
                  <p className="text-xs text-charcoal-900 leading-normal font-semibold">
                    {t.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="bg-transparent border-0 hover:text-charcoal-700 text-charcoal-400 p-0 text-xs self-start"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* TOP HEADER STATUS */}
      <header className="bg-gradient-to-r from-[#212622] to-[#2a302b] text-cream-100 py-3.5 px-6 border-b border-sage-800 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sage-500 flex items-center justify-center text-white shadow-xs">
              <ChefHat className="w-5 h-5 text-[#fdf2e1]" />
            </div>
            <div>
              <span className="text-[9px] bg-amber-500/20 text-ochre-100 px-2 py-0.5 rounded-full font-mono font-medium tracking-wider">
                CHEF COMMAND RESTAURANT OS
              </span>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                CookFlow CRM <span className="text-xs text-sage-300 font-normal">v2.5 Localized Indian Market</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Quick Kitchen Active Timer Module */}
            <div className="flex items-center gap-2 bg-[#1b1f1c] px-3 py-1.5 rounded-lg border border-sage-800 text-cream-100">
              <Timer className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="text-gray-400 text-[10px]">{timerLabel}:</span>
              <span className="font-bold text-amber-400">{formatTimer(timerSeconds)}</span>
              {timerActive ? (
                <button 
                  onClick={() => setTimerActive(false)}
                  className="p-0.5 text-rose-400 hover:text-white transition-colors bg-transparent border-0"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <button 
                  onClick={() => setTimerActive(true)}
                  className="p-0.5 text-emerald-400 hover:text-white transition-colors bg-transparent border-0"
                >
                  <Play className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] bg-sage-800/40 px-3 py-1.5 rounded-lg border border-sage-800 text-sage-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>INR Standard Active Office</span>
            </div>
          </div>

        </div>
      </header>

      {/* CORE WORKSPACE SECTION: COLLAPSIBLE SIDEBAR + MAIN CONTENT AREA (CRM LOOK & FEEL) */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* SIDE NAV PANEL (CRM NAVIGATION) */}
        <nav className="w-full md:w-64 bg-[#232924] text-gray-300 p-5 flex flex-col gap-6 font-medium tracking-tight border-r border-[#2d352e] shrink-0">
          
          {/* User Chef Profile card */}
          <div className="bg-[#1c221e] p-3 rounded-xl border border-sage-800/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sage-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-amber-500">
              Chef
            </div>
            <div>
              <p className="text-xs text-white font-bold tracking-tight">Mumbai Professional Unit</p>
              <p className="text-[10px] text-gray-400">Owner: {servings} Servings Crew</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-sage-400/80 uppercase block px-2 mb-2">
              KITCHEN WORKFLOWS
            </span>

            {/* Dashboard Navigation */}
            <button
              onClick={() => setActiveScreen("dashboard")}
              disabled={!orchestrationResult && !isLoading}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-3 transition-all ${
                activeScreen === "dashboard"
                  ? "bg-sage-500 text-white shadow-xs"
                  : !orchestrationResult
                  ? "opacity-50 cursor-not-allowed hover:bg-transparent"
                  : "hover:bg-[#2b332d] hover:text-white text-gray-300"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              CRM Kitchen Dashboard
            </button>

            {/* Daily Routine Setup */}
            <button
              onClick={() => setActiveScreen("scheduler")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-3 transition-all ${
                activeScreen === "scheduler"
                  ? "bg-sage-500 text-white shadow-xs"
                  : "hover:bg-[#2b332d] hover:text-white text-gray-300"
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              Configure Routines
            </button>

            {/* Structured Meal Scheduler / Active Board */}
            <button
              onClick={() => setActiveScreen("kitchen-board")}
              disabled={!orchestrationResult && !isLoading}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-3 transition-all ${
                activeScreen === "kitchen-board"
                  ? "bg-sage-500 text-white shadow-xs"
                  : !orchestrationResult
                  ? "opacity-50 cursor-not-allowed hover:bg-transparent"
                  : "hover:bg-[#2b332d] hover:text-white text-gray-300"
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 shrink-0" />
              Active Culinary Board
            </button>

            {/* Smart Groceries Tracker */}
            <button
              onClick={() => setActiveScreen("grocery")}
              disabled={!orchestrationResult && !isLoading}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-3 transition-all ${
                activeScreen === "grocery"
                  ? "bg-sage-500 text-white shadow-xs"
                  : !orchestrationResult
                  ? "opacity-50 cursor-not-allowed hover:bg-transparent"
                  : "hover:bg-[#2b332d] hover:text-white text-gray-300"
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              Grocery Shopping Check
              {totalGroceriesCount > 0 && (
                <span className="ml-auto bg-[#1a1e1b] text-sage-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold font-sans">
                  {tickedGroceriesCount}/{totalGroceriesCount}
                </span>
              )}
            </button>

            {/* AI substitutions ledger */}
            <button
              onClick={() => setActiveScreen("substitutions")}
              disabled={!orchestrationResult && !isLoading}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-3 transition-all ${
                activeScreen === "substitutions"
                  ? "bg-sage-500 text-white shadow-xs"
                  : !orchestrationResult
                  ? "opacity-50 cursor-not-allowed hover:bg-transparent"
                  : "hover:bg-[#2b332d] hover:text-white text-gray-300"
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 shrink-0" />
              Allergen Swaps Ledger
            </button>

            {/* Budget Audit Ledger */}
            <button
              onClick={() => setActiveScreen("budget-ledger")}
              disabled={!orchestrationResult && !isLoading}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-3 transition-all ${
                activeScreen === "budget-ledger"
                  ? "bg-sage-500 text-white shadow-xs"
                  : !orchestrationResult
                  ? "opacity-50 cursor-not-allowed hover:bg-transparent"
                  : "hover:bg-[#2b332d] hover:text-white text-gray-300"
              }`}
            >
              <Receipt className="w-4 h-4 shrink-0" />
              INR Financial Audit
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-sage-400/80 uppercase block px-2 mb-2">
              REALTIME DIAGNOSTICS & SYSTEM
            </span>

            {/* Full Agent Trace terminal */}
            <button
              onClick={() => setActiveScreen("trace")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-3 transition-all ${
                activeScreen === "trace"
                  ? "bg-sage-500 text-white shadow-xs"
                  : "hover:bg-[#2b332d] hover:text-white text-gray-300"
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0 animate-pulse text-amber-400" />
              Live Agent trace
              {isLoading && (
                <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>
          </div>

          <div className="mt-auto pt-6 border-t border-sage-800/80 text-[10px] text-gray-400 leading-normal space-y-1">
            <p>🔒 Enterprise Sandbox mode</p>
            <p>Database: Memory State Session</p>
            <p>Currency Base: INR (₹)</p>
          </div>

        </nav>

        {/* MAIN DESK COMPONENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* TOP REALTIME METRICS STRIP */}
          {orchestrationResult && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-4 rounded-xl border border-cream-200 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-sage-50 text-sage-500 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-sage-600" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">Daily Cook Work</span>
                  <span className="text-sm font-bold text-gray-900 block font-mono">
                    {totalCookingMinutesTarget} Mins Prep Time
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-cream-200 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-ochre-50 text-ochre-500 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5 text-ochre-700" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium font-sans">Optimized Cost</span>
                  <span className="text-sm font-bold text-ochre-700 block font-mono">
                    ₹{estimatedOptimizedSum.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-cream-200 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5 text-rose-700" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium font-sans">Financial Balance</span>
                  <span className="text-sm font-bold text-gray-900 block font-mono flex items-center gap-1">
                    {estimatedOptimizedSum <= budget ? (
                      <span className="text-emerald-600">Within ₹{budget}</span>
                    ) : (
                      <span className="text-rose-600 font-bold">Exceeds By ₹{(estimatedOptimizedSum - budget).toFixed(0)}</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-cream-200 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium font-sans">Token Expenditure</span>
                  <span className="text-sm font-bold text-gray-900 block font-mono">
                    {orchestrationResult.metrics?.totalTokens || 0} TikToken Est.
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ACTIVE CONTENT WORKSPACE PANES */}
          
          {/* SCREEN 1: THE RICH DASHBOARD OVERVIEW */}
          {activeScreen === "dashboard" && orchestrationResult && (
            <div className="space-y-6">
              
              {/* HEADING ACCENT BANNER */}
              <div className="bg-gradient-to-r from-sage-900 to-sage-800 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-[-20%] opacity-15">
                  <ChefHat className="w-64 h-64 text-white" />
                </div>
                
                <span className="text-xs bg-amber-500 text-charcoal-900 px-3 py-1 rounded-full font-mono font-bold select-none uppercase tracking-wide">
                  Welcome back, Chef
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white mt-3 font-sans">
                  Active Culinary CRM Core Dashboard
                </h2>
                <p className="text-xs text-sage-200 mt-1 max-w-xl font-medium">
                  We've successfully correlated your day's schedule. Balanced budget targets are live, allergen precautions are active.
                </p>

                <div className="flex gap-4 mt-5 pt-4 border-t border-sage-700/60 flex-wrap">
                  <div className="bg-sage-800/80 px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-2">
                    <span className="text-amber-400 font-semibold font-mono">Caloric Requirement:</span>
                     {orchestrationResult.routineAnalysis?.energyNeed || "Medium"} Calorie
                  </div>
                  <div className="bg-sage-800/80 px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-2">
                    <span className="text-amber-400 font-semibold font-mono">Kitchen Servings:</span>
                    {servings} Portions
                  </div>
                  <div className="bg-sage-800/80 px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-2">
                    <span className="text-amber-400 font-semibold font-mono">Allergies Warning:</span>
                    <span className="font-semibold text-rose-300 font-sans">{allergies || "None"}</span>
                  </div>
                </div>
              </div>

              {/* THREE COLUMN SUMMARY WORKSPACE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Today's Menu Checklist Widget */}
                <div className="bg-white p-6 rounded-xl border border-cream-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase text-sage-700 font-mono tracking-wider">🛠️ Kitchen Schedule Menu</span>
                      <span className="text-[10px] text-gray-400">Time-window locked</span>
                    </div>

                    <div className="space-y-3.5 mt-2">
                      <div className="p-3 bg-[#fdfaf5] hover:bg-ochre-50/50 rounded-xl border border-cream-200 transition-colors cursor-pointer flex justify-between items-center"
                           onClick={() => setActiveScreen("kitchen-board")}>
                        <div>
                          <span className="text-[9px] bg-amber-500 font-bold text-white uppercase px-1.5 py-0.5 rounded font-mono">Breakfast</span>
                          <span className="text-xs font-bold text-charcoal-900 block mt-1">
                            {orchestrationResult.mealPlan?.breakfast?.name}
                          </span>
                          {orchestrationResult.mealPlan?.breakfast?.macros && (
                            <span className="text-[10px] text-sage-800 font-mono block mt-1 bg-amber-100/40 px-1 py-0.5 rounded border border-cream-200 inline-block">
                              ⚡ {orchestrationResult.mealPlan.breakfast.macros.calories} kcal | P: {orchestrationResult.mealPlan.breakfast.macros.protein}g | C: {orchestrationResult.mealPlan.breakfast.macros.carbs}g | F: {orchestrationResult.mealPlan.breakfast.macros.fat}g
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-sage-700 font-mono font-bold flex items-center gap-1 whitespace-nowrap bg-white px-2 py-1 rounded-md border text-center self-start">
                          <Clock className="w-3.5 h-3.5 text-ochre-500" /> {orchestrationResult.mealPlan?.breakfast?.prepTime}m
                        </span>
                      </div>

                      <div className="p-3 bg-[#faf9f6] hover:bg-sage-50 transition-colors rounded-xl border border-cream-200 cursor-pointer flex justify-between items-center"
                           onClick={() => setActiveScreen("kitchen-board")}>
                        <div>
                          <span className="text-[9px] bg-yellow-500 font-bold text-white uppercase px-1.5 py-0.5 rounded font-mono">Lunch</span>
                          <span className="text-xs font-bold text-charcoal-900 block mt-1">
                            {orchestrationResult.mealPlan?.lunch?.name}
                          </span>
                          {orchestrationResult.mealPlan?.lunch?.macros && (
                            <span className="text-[10px] text-sage-800 font-mono block mt-1 bg-yellow-105/40 px-1 py-0.5 rounded border border-cream-200 inline-block">
                              ⚡ {orchestrationResult.mealPlan.lunch.macros.calories} kcal | P: {orchestrationResult.mealPlan.lunch.macros.protein}g | C: {orchestrationResult.mealPlan.lunch.macros.carbs}g | F: {orchestrationResult.mealPlan.lunch.macros.fat}g
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-sage-700 font-mono font-bold flex items-center gap-1 whitespace-nowrap bg-white px-2 py-1 rounded-md border text-center self-start">
                          <Clock className="w-3.5 h-3.5 text-ochre-500" /> {orchestrationResult.mealPlan?.lunch?.prepTime}m
                        </span>
                      </div>

                      <div className="p-3 bg-[#fafcfb] hover:bg-sage-50 transition-colors rounded-xl border border-cream-200 cursor-pointer flex justify-between items-center"
                           onClick={() => setActiveScreen("kitchen-board")}>
                        <div>
                          <span className="text-[9px] bg-emerald-600 font-bold text-white uppercase px-1.5 py-0.5 rounded font-mono">Dinner</span>
                          <span className="text-xs font-bold text-charcoal-900 block mt-1">
                            {orchestrationResult.mealPlan?.dinner?.name}
                          </span>
                          {orchestrationResult.mealPlan?.dinner?.macros && (
                            <span className="text-[10px] text-sage-800 font-mono block mt-1 bg-emerald-100/40 px-1 py-0.5 rounded border border-cream-200 inline-block">
                              ⚡ {orchestrationResult.mealPlan.dinner.macros.calories} kcal | P: {orchestrationResult.mealPlan.dinner.macros.protein}g | C: {orchestrationResult.mealPlan.dinner.macros.carbs}g | F: {orchestrationResult.mealPlan.dinner.macros.fat}g
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-sage-700 font-mono font-bold flex items-center gap-1 whitespace-nowrap bg-white px-2 py-1 rounded-md border text-center self-start">
                          <Clock className="w-3.5 h-3.5 text-ochre-500" /> {orchestrationResult.mealPlan?.dinner?.prepTime}m
                        </span>
                      </div>

                    </div>
                  </div>

                  <button
                    onClick={() => setActiveScreen("kitchen-board")}
                    className="w-full mt-5 py-2.5 bg-sage-50 text-sage-800 hover:bg-sage-100 font-bold rounded-xl text-xs transition-all border border-sage-200"
                  >
                    Open Active Prep Board
                  </button>
                </div>

                {/* 2. Live Grocery Checklist Progress Tracker */}
                <div className="bg-white p-6 rounded-xl border border-cream-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase text-sage-700 font-mono tracking-wider">🛒 Smart Pantry Status</span>
                      <span className="text-[10px] text-gray-400">Total: {totalGroceriesCount} items</span>
                    </div>

                    <div className="space-y-3.5 my-3">
                      {orchestrationResult.budgetAndGroceries?.groceryList?.slice(0, 3).map((item: any, idx: number) => {
                        const isChecked = !!checkedGroceries[item.name];
                        return (
                          <div 
                            key={idx} 
                            onClick={() => {
                              setCheckedGroceries((prev) => ({ ...prev, [item.name]: !isChecked }));
                              addToast(`${isChecked ? 'Readded' : 'Cleared'} ${item.name} from grocery bucket.`, "info", "Pantry check");
                            }}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-cream-100 hover:bg-[#fafafc] transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
                                isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 bg-white"
                              }`}>
                                {isChecked && <span className="text-[10px] font-bold">✓</span>}
                              </div>
                              <span className={`text-xs ${isChecked ? "line-through text-gray-400" : "text-gray-900 font-semibold"}`}>
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 font-bold">{item.quantity}</span>
                          </div>
                        );
                      })}
                      {totalGroceriesCount > 3 && (
                        <p className="text-[10px] text-gray-400 text-center italic">
                          + {totalGroceriesCount - 3} more items in list...
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveScreen("grocery")}
                    className="w-full mt-4 py-2.5 bg-sage-50 text-sage-800 hover:bg-sage-100 font-bold rounded-xl text-xs transition-all border border-sage-200"
                  >
                    Manage Fully Aggregated Basket
                  </button>
                </div>

                {/* 3. Budget audit highlights */}
                <div className="bg-white p-6 rounded-xl border border-cream-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase text-sage-700 font-mono tracking-wider">💹 Cost Reduction Log</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 rounded px-1.5 py-0.5 font-bold font-mono">
                        {orchestrationResult.budgetAndGroceries?.costReductionApplied ? "OPTIMIZED" : "STABLE"}
                      </span>
                    </div>

                    <div className="space-y-3.5 my-3">
                      <div className="bg-cream-100/60 p-3 rounded-lg border text-xs text-charcoal-800 leading-normal">
                        <span className="font-bold text-sage-800 block mb-1">Financial summary:</span>
                        {orchestrationResult.budgetAndGroceries?.isExceeded ? (
                          <div className="text-rose-700 font-medium">
                            🚨 Original calculation was ₹{estimatedOriginalSum.toFixed(2)}, which violated your ₹{budget.toFixed(2)} constraint.
                          </div>
                        ) : (
                          <div className="text-emerald-700">
                            Excellent! Estimations show ₹{estimatedOriginalSum.toFixed(2)} which runs fully within your boundary.
                          </div>
                        )}
                        <p className="mt-2 text-[11px] text-gray-500 font-bold">
                          Advice: {orchestrationResult.budgetAndGroceries?.savingsDetails?.budgetAdvice || "Shop at regional Indian bazaars for maximum loose volume discount."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveScreen("budget-ledger")}
                    className="w-full mt-4 py-2.5 bg-sage-50 text-sage-800 hover:bg-sage-100 font-bold rounded-xl text-xs transition-all border border-sage-200"
                  >
                    Audit Savings Ledger
                  </button>
                </div>

              </div>

              {/* Chef Active Swaps Notice Box */}
              {orchestrationResult.substitutionsList && orchestrationResult.substitutionsList.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-[#6e461a] animate-fade-in">
                  <div className="flex items-center gap-2 mb-2 font-bold text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    Recommended Local Substitutions Alert ({orchestrationResult.substitutionsList.length} swaps mapped):
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
                    {orchestrationResult.substitutionsList.slice(0, 2).map((sub: any, idx: number) => (
                      <div key={idx} className="bg-white/80 p-2.5 rounded-lg border border-amber-100/80">
                        <span className="font-bold text-amber-900 font-sans block text-xs">
                          {sub.originalItem} ➔ <span className="text-emerald-700 font-extrabold">{sub.substitutedWith}</span>
                        </span>
                        <span className="text-[10px] text-gray-500 italic block mt-0.5">{sub.reasonType} - {sub.culinaryBenefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* SCREEN 2: CONFIGURE ROUTINES & DAY INPUT SCHEDULER */}
          {activeScreen === "scheduler" && (
            <div className="space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-sage-600" />
                  Day Schedule Preset Manager
                </h3>
                <p className="text-xs text-gray-500">Pick standard chef schedule macros or input customized constraints directly</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-cream-200 shadow-xs space-y-6">
                
                {/* Visual Preset Pickers */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700 block mb-3">
                    Available Indian Regional Presets
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {INDIAN_PRESETS.map((preset, index) => {
                      const isActive = routine === preset.routine;
                      return (
                        <div
                          key={index}
                          onClick={() => handleApplyPreset(preset)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer text-left hover:border-sage-400 ${
                            isActive 
                              ? "bg-sage-50 border-sage-500 ring-2 ring-sage-300" 
                              : "bg-cream-100/50 border-cream-200"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              {preset.label}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-white text-sage-700 px-2 py-0.5 rounded border">
                              ₹{preset.budget} Target
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed italic line-clamp-2">
                            "{preset.routine}"
                          </p>
                          <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
                            <span>Servings: {preset.servings} guests</span>
                            <span>Mandi Source: {preset.pantryAverages}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom input forms */}
                <div className="space-y-4 pt-4 border-t border-cream-100">
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-sage-700 mb-1.5 flex justify-between">
                      <span>Detailed Custom Routine Description</span>
                      <span className="text-gray-400 lowercase font-normal italic">supports commute hours, physical exercises & standup timings</span>
                    </label>
                    <textarea
                      rows={4}
                      value={routine}
                      onChange={(e) => setRoutine(e.target.value)}
                      placeholder="E.g., 9-5 busy desk routine, commuting to office at 8am, gym routine at night, want quick cooking guides."
                      className="w-full text-xs font-medium p-3.5 rounded-xl border border-cream-300 focus:ring-2 focus:ring-sage-500 bg-cream-50 placeholder:text-gray-400 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* INR Budget Slider */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-sage-700 mb-1.5 flex justify-between">
                        <span>INR Kitchen Budget Limit (Daily)</span>
                        <span className="font-mono text-ochre-700 font-bold">₹{budget}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="100"
                          max="3000"
                          step="50"
                          value={budget}
                          onChange={(e) => setBudget(Number(e.target.value))}
                          className="w-full accent-sage-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400 px-1 mt-1 font-mono">
                        <span>₹100 Budget</span>
                        <span>₹3000 Luxury Splurge</span>
                      </div>
                    </div>

                    {/* Portions custom adjustment */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-sage-700 mb-1.5 flex justify-between">
                        <span>Servings Portions Ratio</span>
                        <span className="font-mono font-bold text-sage-700">{servings} Cook Plate(s)</span>
                      </label>
                      <div className="flex items-center border border-cream-300 rounded-lg bg-cream-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setServings(Math.max(1, servings - 1))}
                          className="px-3 py-2 hover:bg-cream-200 text-gray-500 font-extrabold border-0 bg-transparent text-xs"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center text-xs font-mono font-extrabold">{servings} Serving{servings > 1 ? 's' : ''}</span>
                        <button
                          type="button"
                          onClick={() => setServings(Math.min(12, servings + 1))}
                          className="px-3 py-2 hover:bg-cream-200 text-gray-500 font-extrabold border-0 bg-transparent text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Allergen restriction checks */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-sage-700 mb-1.5">
                        Dietary Restrictives
                      </label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="E.g. Vegetarian, Gluten-Free, No Nuts, Peanut Allergy"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-cream-300 focus:ring-2 focus:ring-sage-500 bg-cream-50"
                      />
                    </div>

                  </div>

                  {/* Mandi source selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-sage-700 mb-1">
                      Local Pantry Pricing Matrix Averages
                    </label>
                    <select
                      value={pantryAverages}
                      onChange={(e) => setPantryAverages(e.target.value)}
                      className="w-full text-xs font-medium p-2.5 rounded-lg border border-cream-300 bg-cream-50"
                    >
                      <option value="Mumbai Mandi">Mumbai Local Wholesale Mandi rates (Best leafies discount)</option>
                      <option value="Vidyaranyapura local grocery">Bangalore local retail shops (Bulk dry provisions savings)</option>
                      <option value="Delhi Supermarket Delivery">Delhi standard online home delivery apps (Flat packaged grains)</option>
                      <option value="Premium Spices Bazaar">Premium Spices Bazaar (Whole traditional spices premium)</option>
                    </select>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={handleOrchestrate}
                      disabled={isLoading}
                      className="px-6 py-3.5 bg-sage-500 hover:bg-sage-600 text-white font-bold rounded-xl shadow-lg shadow-sage-200 text-xs flex items-center gap-2 transition-all border-0"
                    >
                      <Cpu className="w-4 h-4 text-amber-300" />
                      {isLoading ? "Running pipeline orchestration..." : "Re-launch Multi-Agent Workflows"}
                    </button>
                    {orchestrationResult && (
                      <button
                        onClick={() => {
                          setActiveScreen("dashboard");
                          addToast("Returned to current dashboard stats", "info", "Workspace Navigation");
                        }}
                        className="px-4 py-3.5 bg-cream-200 hover:bg-cream-300 text-gray-700 font-bold rounded-xl text-xs transition-all border-0"
                      >
                        Cancel & View Dashboard
                      </button>
                    )}
                  </div>

                </div>

              </div>
              
            </div>
          )}

          {/* SCREEN 3: ACTIVE CULINARY BOARD / KANBAN MEALS AND PREPARATION STEPS */}
          {activeScreen === "kitchen-board" && orchestrationResult && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-sage-600" />
                    Kitchen Active Prep Board
                  </h3>
                  <p className="text-xs text-gray-500">Staggered step checklists suited perfectly to fits routine cooking windows</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-orange-850 bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-lg">
                    Total Time Quota: {totalCookingMinutesTarget} Minutes limit
                  </span>
                </div>
              </div>

              {/* THREE COLUMN KANBAN BOARDS (Breakfast, Lunch, Dinner) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* BREAKFAST COLUMN */}
                {orchestrationResult.mealPlan?.breakfast && (
                  <div className="bg-white p-5 rounded-xl border border-cream-200 shadow-xs flex flex-col justify-between min-h-[500px]">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-cream-100 mb-3.5">
                        <span className="text-[10px] uppercase tracking-widest font-bold font-mono text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded">
                          🥞 Breakfast Block
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-ochre-500" /> {orchestrationResult.mealPlan.breakfast.prepTime} mins
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 tracking-tight leading-snug mb-1">
                        {orchestrationResult.mealPlan.breakfast.name}
                      </h4>
                      <p className="text-xs text-gray-500 leading-snug mb-3">
                        {orchestrationResult.mealPlan.breakfast.description}
                      </p>

                      {/* Macronutrients display */}
                      {orchestrationResult.mealPlan.breakfast.macros && (
                        <div className="grid grid-cols-4 gap-1.5 mb-4 bg-amber-50/50 p-2 rounded-lg border border-cream-200 text-center text-[11px] font-mono leading-tight">
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold">KCAL</span>
                            <span className="font-bold text-charcoal-900">{orchestrationResult.mealPlan.breakfast.macros.calories || 0}</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold text-orange-600">PRO</span>
                            <span className="font-bold text-orange-700">{orchestrationResult.mealPlan.breakfast.macros.protein || 0}g</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold text-indigo-600">CARB</span>
                            <span className="font-bold text-indigo-700">{orchestrationResult.mealPlan.breakfast.macros.carbs || 0}g</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold text-amber-600">FAT</span>
                            <span className="font-bold text-amber-700">{orchestrationResult.mealPlan.breakfast.macros.fat || 0}g</span>
                          </div>
                        </div>
                      )}

                      {/* Ingredients micro list */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase font-mono tracking-widest">Ingredients list:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {orchestrationResult.mealPlan.breakfast.ingredients?.map((i: any, ind: number) => (
                            <span key={ind} className="bg-cream-100 text-charcoal-800 text-[10px] font-sans px-2 py-1 rounded font-medium border border-cream-200">
                              {i.name} ({i.amount})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Checklist steps */}
                      <div className="space-y-2 pt-2.5 border-t border-cream-100">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase font-mono tracking-widest">Target steps:</span>
                        {orchestrationResult.mealPlan.breakfast.steps?.map((step: string, stepIdx: number) => {
                          const key = `breakfast_step_${stepIdx}`;
                          const isDone = !!checkedRecipeSteps[key];
                          return (
                            <div 
                              key={stepIdx}
                              onClick={() => setCheckedRecipeSteps((prev) => ({ ...prev, [key]: !isDone }))}
                              className="flex items-start gap-2 p-2 rounded hover:bg-[#faf9f6] transition-colors cursor-pointer text-xs"
                            >
                              <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                isDone ? "bg-[#4e6e58] border-[#4e6e58] text-white" : "border-gray-300 bg-white"
                              }`}>
                                {isDone && <span className="text-[9px] font-bold">✓</span>}
                              </div>
                              <span className={`leading-relaxed ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    <button
                      onClick={() => triggerTimerCountdown(orchestrationResult.mealPlan.breakfast.prepTime || 12, orchestrationResult.mealPlan.breakfast.name)}
                      className="w-full mt-6 py-2 bg-sage-500 hover:bg-sage-600 text-cream-100 hover:text-white font-bold rounded-lg text-xs transition-colors border-0"
                    >
                      🍳 Activate Prep Timer
                    </button>
                  </div>
                )}

                {/* LUNCH COLUMN */}
                {orchestrationResult.mealPlan?.lunch && (
                  <div className="bg-white p-5 rounded-xl border border-cream-200 shadow-xs flex flex-col justify-between min-h-[500px]">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-cream-100 mb-3.5">
                        <span className="text-[10px] uppercase tracking-widest font-bold font-mono text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                          🥪 Packed Lunch Block
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-ochre-500" /> {orchestrationResult.mealPlan.lunch.prepTime} mins
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 tracking-tight leading-snug mb-1">
                        {orchestrationResult.mealPlan.lunch.name}
                      </h4>
                      <p className="text-xs text-gray-500 leading-snug mb-3">
                        {orchestrationResult.mealPlan.lunch.description}
                      </p>

                      {/* Macronutrients display */}
                      {orchestrationResult.mealPlan.lunch.macros && (
                        <div className="grid grid-cols-4 gap-1.5 mb-4 bg-yellow-50/50 p-2 rounded-lg border border-cream-200 text-center text-[11px] font-mono leading-tight">
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold">KCAL</span>
                            <span className="font-bold text-charcoal-900">{orchestrationResult.mealPlan.lunch.macros.calories || 0}</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold text-orange-600">PRO</span>
                            <span className="font-bold text-orange-700">{orchestrationResult.mealPlan.lunch.macros.protein || 0}g</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold text-indigo-600">CARB</span>
                            <span className="font-bold text-indigo-700">{orchestrationResult.mealPlan.lunch.macros.carbs || 0}g</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold text-amber-600">FAT</span>
                            <span className="font-bold text-amber-700">{orchestrationResult.mealPlan.lunch.macros.fat || 0}g</span>
                          </div>
                        </div>
                      )}

                      {/* Ingredients micro list */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase font-[#9fb5a2] font-mono tracking-widest animate-pulse">Ingredients list:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {orchestrationResult.mealPlan.lunch.ingredients?.map((i: any, ind: number) => (
                            <span key={ind} className="bg-cream-100 text-charcoal-800 text-[10px] font-sans px-2 py-1 rounded font-medium border border-cream-200">
                              {i.name} ({i.amount})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Checklist steps */}
                      <div className="space-y-2 pt-2.5 border-t border-cream-100">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase font-mono tracking-widest font-medium">Target steps:</span>
                        {orchestrationResult.mealPlan.lunch.steps?.map((step: string, stepIdx: number) => {
                          const key = `lunch_step_${stepIdx}`;
                          const isDone = !!checkedRecipeSteps[key];
                          return (
                            <div 
                              key={stepIdx}
                              onClick={() => setCheckedRecipeSteps((prev) => ({ ...prev, [key]: !isDone }))}
                              className="flex items-start gap-2 p-2 rounded hover:bg-[#faf9f6] transition-colors cursor-pointer text-xs"
                            >
                              <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                isDone ? "bg-[#4e6e58] border-[#4e6e58] text-white" : "border-gray-300 bg-white"
                              }`}>
                                {isDone && <span className="text-[9px] font-bold">✓</span>}
                              </div>
                              <span className={`leading-relaxed ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    <button
                      onClick={() => triggerTimerCountdown(orchestrationResult.mealPlan.lunch.prepTime || 15, orchestrationResult.mealPlan.lunch.name)}
                      className="w-full mt-6 py-2 bg-sage-500 hover:bg-sage-600 text-cream-100 hover:text-white font-bold rounded-lg text-xs transition-colors border-0"
                    >
                      🍳 Activate Prep Timer
                    </button>
                  </div>
                )}

                {/* DINNER COLUMN */}
                {orchestrationResult.mealPlan?.dinner && (
                  <div className="bg-white p-5 rounded-xl border border-cream-200 shadow-xs flex flex-col justify-between min-h-[500px]">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-cream-100 mb-3.5">
                        <span className="text-[10px] uppercase tracking-widest font-bold font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          🍲 Dinner Block
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-ochre-500" /> {orchestrationResult.mealPlan.dinner.prepTime} mins
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 tracking-tight leading-snug mb-1">
                        {orchestrationResult.mealPlan.dinner.name}
                      </h4>
                      <p className="text-xs text-gray-500 leading-snug mb-3">
                        {orchestrationResult.mealPlan.dinner.description}
                      </p>

                      {/* Macronutrients display */}
                      {orchestrationResult.mealPlan.dinner.macros && (
                        <div className="grid grid-cols-4 gap-1.5 mb-4 bg-emerald-50/50 p-2 rounded-lg border border-cream-200 text-center text-[11px] font-mono leading-tight">
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold">KCAL</span>
                            <span className="font-bold text-charcoal-900">{orchestrationResult.mealPlan.dinner.macros.calories || 0}</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold text-orange-600">PRO</span>
                            <span className="font-bold text-orange-700">{orchestrationResult.mealPlan.dinner.macros.protein || 0}g</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold text-indigo-600">CARB</span>
                            <span className="font-bold text-indigo-700">{orchestrationResult.mealPlan.dinner.macros.carbs || 0}g</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded border border-cream-100">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wide font-bold text-amber-600">FAT</span>
                            <span className="font-bold text-amber-700">{orchestrationResult.mealPlan.dinner.macros.fat || 0}g</span>
                          </div>
                        </div>
                      )}

                      {/* Ingredients micro list */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase font-[#9fb5a2] font-mono tracking-widest font-medium">Ingredients list:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {orchestrationResult.mealPlan.dinner.ingredients?.map((i: any, ind: number) => (
                            <span key={ind} className="bg-cream-100 text-charcoal-800 text-[10px] font-sans px-2 py-1 rounded font-medium border border-cream-200">
                              {i.name} ({i.amount})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Checklist steps */}
                      <div className="space-y-2 pt-2.5 border-t border-cream-100">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1 uppercase font-mono tracking-widest font-medium">Target steps:</span>
                        {orchestrationResult.mealPlan.dinner.steps?.map((step: string, stepIdx: number) => {
                          const key = `dinner_step_${stepIdx}`;
                          const isDone = !!checkedRecipeSteps[key];
                          return (
                            <div 
                              key={stepIdx}
                              onClick={() => setCheckedRecipeSteps((prev) => ({ ...prev, [key]: !isDone }))}
                              className="flex items-start gap-2 p-2 rounded hover:bg-[#faf9f6] transition-colors cursor-pointer text-xs"
                            >
                              <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                isDone ? "bg-[#4e6e58] border-[#4e6e58] text-white" : "border-gray-300 bg-white"
                              }`}>
                                {isDone && <span className="text-[9px] font-bold">✓</span>}
                              </div>
                              <span className={`leading-relaxed ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    <button
                      onClick={() => triggerTimerCountdown(orchestrationResult.mealPlan.dinner.prepTime || 30, orchestrationResult.mealPlan.dinner.name)}
                      className="w-full mt-6 py-2 bg-sage-500 hover:bg-sage-600 text-cream-100 hover:text-white font-bold rounded-lg text-xs transition-colors border-0"
                    >
                      🍳 Activate Prep Timer
                    </button>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* SCREEN 4: SMART GROCERY SHOPPING BASKET */}
          {activeScreen === "grocery" && orchestrationResult && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#2c302d] tracking-tight flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-sage-600" />
                    Consolidated Grocery Shopping List
                  </h3>
                  <p className="text-xs text-gray-400">Aggregated quantities mapped from all active meal segments</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const all: Record<string, boolean> = {};
                      orchestrationResult.budgetAndGroceries?.groceryList?.forEach((i: any) => {
                        all[i.name] = true;
                      });
                      setCheckedGroceries(all);
                      addToast("Marked all grocery items purchased", "success", "Shopping CRM");
                    }}
                    className="px-3 py-1.5 bg-cream-200 text-gray-700 font-bold rounded-lg text-xs hover:bg-cream-300 transition-colors border-0"
                  >
                    Mark All Purchased
                  </button>
                  <button
                    onClick={() => {
                      setCheckedGroceries({});
                      addToast("Cleared shopping basket checkmarks", "info", "Shopping CRM");
                    }}
                    className="px-3 py-1.5 bg-cream-200 text-gray-700 font-bold rounded-lg text-xs hover:bg-cream-300 transition-colors border-0"
                  >
                    Reset Checkmarks
                  </button>
                </div>
              </div>

              {/* GROCERY CATEGORY MAPS CARD */}
              <div className="bg-white rounded-xl border border-cream-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-sage-900 text-cream-100 text-xs font-mono font-bold flex justify-between">
                  <span>INGREDIENT IDENTIFIER</span>
                  <div className="flex gap-8">
                    <span>UNIT VALUE</span>
                    <span className="w-20 text-right">PRICE (INR)</span>
                  </div>
                </div>

                <div className="divide-y divide-cream-100">
                  {orchestrationResult.budgetAndGroceries?.groceryList?.map((item: any, idx: number) => {
                    const isChecked = !!checkedGroceries[item.name];
                    return (
                      <div 
                        key={idx}
                        onClick={() => setCheckedGroceries((prev) => ({ ...prev, [item.name]: !isChecked }))}
                        className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-cream-50/50 cursor-pointer transition-colors ${
                          isChecked ? "bg-emerald-50/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-300 bg-white"
                          }`}>
                            {isChecked && <span className="text-xs font-bold font-sans">✓</span>}
                          </div>
                          <div>
                            <span className={`text-sm font-semibold block ${isChecked ? "line-through text-gray-400" : "text-gray-900"}`}>
                              {item.name}
                            </span>
                            <span className="text-[10px] text-gray-400 border border-cream-200 px-1.5 py-0.2 rounded mt-0.5 inline-block bg-white">
                              {item.category || "Produce"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-cream-100">
                          <span className="text-xs font-mono text-gray-600 font-bold bg-cream-100 px-2.5 py-0.5 rounded">
                            {item.quantity}
                          </span>
                          <span className="text-xs font-mono font-bold text-gray-900 w-20 text-right">
                            ₹{item.totalItemCost ? Number(item.totalItemCost).toFixed(0) : "N/A"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* GROCERY FOOTER PRICE ACCENT CARD */}
                <div className="p-6 bg-cream-100/60 border-t border-cream-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-xs text-gray-500">
                    Pantry sourcing pricing based on: <strong>{pantryAverages || "Mumbai Mandi"} indices</strong>.
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-gray-500">Consolidated estimated cost:</span>
                    <span className="text-xl font-bold font-mono text-gray-900">
                      ₹{estimatedOriginalSum.toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* SCREEN 5: AI CULINARY SUBSTITUTIONS & ALLERGEN LEDGER */}
          {activeScreen === "substitutions" && orchestrationResult && (
            <div className="space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-sage-600" />
                  AI Swaps & Allergen Substitutions Ledger
                </h3>
                <p className="text-xs text-gray-500">Smart alternatives to circumvent expensive items, allergies or standard intolerances</p>
              </div>

              {orchestrationResult.substitutionsList && orchestrationResult.substitutionsList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orchestrationResult.substitutionsList.map((sub: any, idx: number) => {
                    let typeBadge = "bg-blue-100 text-blue-800";
                    if (sub.reasonType === "Cost Saving") typeBadge = "bg-emerald-100 text-emerald-800";
                    else if (sub.reasonType === "Allergy Friendly") typeBadge = "bg-rose-100 text-rose-800";
                    else if (sub.reasonType === "Dietary Swap") typeBadge = "bg-amber-100 text-amber-800";

                    return (
                      <div key={idx} className="bg-white p-5 rounded-xl border border-cream-200 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded font-mono ${typeBadge}`}>
                              {sub.reasonType}
                            </span>
                            <span className="text-[10px] text-gray-400">Active chef check</span>
                          </div>

                          <div className="flex items-center gap-3 bg-cream-50 p-3 rounded-lg border border-cream-200 mb-3 text-xs">
                            <span className="font-semibold text-gray-500">Original Item:</span>
                            <span className="line-through text-rose-600 font-bold">{sub.originalItem}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-emerald-700 font-extrabold">{sub.substitutedWith}</span>
                          </div>

                          <p className="text-xs text-gray-600 leading-relaxed font-sans pt-1">
                            <strong className="text-charcoal-900 block font-sans mb-0.5">Culinary justification:</strong>
                            {sub.culinaryBenefit}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-cream-100 mt-4 text-[10px] text-gray-400 flex justify-between">
                          <span>Status: Suggestive optimization</span>
                          <span>Source: Substitution Agent Node</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-xl text-center border">
                  <Info className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-500 italic">No allergen swaps necessary for this layout profile.</p>
                </div>
              )}

            </div>
          )}

          {/* SCREEN 6: BUDGET ANALYSIS LEDGER & ADVICE */}
          {activeScreen === "budget-ledger" && orchestrationResult && (
            <div className="space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-sage-600" />
                  Indian Rupees (INR) Financial Audit Log
                </h3>
                <p className="text-xs text-gray-500">Auditing the multi-agent budget optimization feedback loop</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual meter card */}
                <div className="bg-white p-6 rounded-xl border border-cream-200 shadow-xs lg:col-span-1 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-700 block">Financial Limits Meter</span>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Daily routine target limit:</span>
                      <span className="font-mono font-bold text-gray-900">₹{budget.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Original grocery sum:</span>
                      <span className="font-mono font-bold text-gray-900">₹{estimatedOriginalSum.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-bold text-sage-700">Final optimized cost:</span>
                      <span className="font-mono font-bold text-emerald-700">₹{estimatedOptimizedSum.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="w-full h-3.5 bg-cream-100 rounded-full border border-cream-200 overflow-hidden relative">
                    <div 
                      className={`h-full transition-all ${estimatedOptimizedSum <= budget ? "bg-emerald-500" : "bg-rose-500"}`} 
                      style={{ width: `${Math.min(100, (estimatedOptimizedSum / budget) * 100)}%` }}
                    />
                  </div>

                  <div className="p-3 rounded bg-cream-50 text-[11px] text-gray-500 font-medium leading-relaxed">
                    <strong>Budget Optimizer Advice:</strong> {orchestrationResult.budgetAndGroceries?.savingsDetails?.budgetAdvice || "Switch to seasonal veggies rather than frozen bags for 30% instant daily grocery cost reduction."}
                  </div>
                </div>

                {/* Subloop items ledger */}
                <div className="bg-white p-6 rounded-xl border border-cream-200 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-sage-700 block">Optimized Items Subloop Logs</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 rounded font-bold font-mono px-2 py-0.5">
                      SAVED: ₹{(orchestrationResult.budgetAndGroceries?.savingsDetails?.savingsAchieved || 0).toFixed(0)}
                    </span>
                  </div>

                  {orchestrationResult.budgetAndGroceries?.savingsDetails?.itemsOptimized && orchestrationResult.budgetAndGroceries.savingsDetails.itemsOptimized.length > 0 ? (
                    <div className="divide-y divide-cream-100 border rounded-lg overflow-hidden bg-cream-50/20">
                      {orchestrationResult.budgetAndGroceries.savingsDetails.itemsOptimized.map((opt: any, idx: number) => (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white">
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">{opt.itemName}</span>
                            <span className="text-[11px] text-emerald-700 block mt-0.5">🔨 {opt.actionTaken}</span>
                          </div>
                          <div className="flex items-baseline gap-2 font-mono text-xs">
                            <span className="text-gray-400 line-through">₹{opt.originalPrice}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-extrabold text-gray-800">₹{opt.newPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-cream-50 border rounded text-center text-xs text-gray-500 italic">
                      Zero items flagged for price cuts. Menu fits local standard budget perfectly.
                    </div>
                  )}
                </div>

              </div>
              
            </div>
          )}

          {/* SCREEN 7: LIVE MULTI-AGENT HANDSHAKE TRACE MONITOR & TOKENS */}
          {activeScreen === "trace" && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight flex flex-col">
                    <span className="flex items-center gap-1.5"><Cpu className="w-5 h-5 text-sage-600" /> Multi-Agent Execution Handshake Trace</span>
                  </h3>
                  <p className="text-xs text-gray-400">Observe raw sequential parameters passed across agents in real-time</p>
                </div>

                {isLoading && (
                  <span className="bg-cyan-100 text-cyan-800 text-[11px] px-3.5 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping inline-block" /> Realtime processing...
                  </span>
                )}
              </div>

              {/* LIVE COUNTERS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-[#242925] p-4 rounded-xl border border-sage-800 text-cream-100 font-mono text-xs">
                  <span className="text-gray-400 text-[10px] uppercase block mb-1">TikToken Estimated Count</span>
                  <span className="text-lg font-extrabold text-teal-400">{liveTokens} tokens</span>
                </div>

                <div className="bg-[#242925] p-4 rounded-xl border border-sage-800 text-cream-100 font-mono text-xs">
                  <span className="text-gray-400 text-[10px] uppercase block mb-1">Estimated Cost base (INR)</span>
                  <span className="text-lg font-extrabold text-[#e2a83e]">₹{liveCostInr.toFixed(5)}</span>
                </div>

                <div className="bg-[#242925] p-4 rounded-xl border border-sage-800 text-cream-100 font-mono text-xs">
                  <span className="text-gray-400 text-[10px] uppercase block mb-1">Current Active Nodes Cpu</span>
                  <span className="text-lg font-extrabold text-emerald-400">{liveCpuMetrics || (isLoading ? 75 : 0)}% load</span>
                </div>

                <div className="bg-[#242925] p-4 rounded-xl border border-sage-800 text-cream-100 font-mono text-xs">
                  <span className="text-gray-400 text-[10px] uppercase block mb-1">Handshake cycle Time</span>
                  <span className="text-lg font-extrabold text-[#c0cdef]">{(liveTimeMs / 1000).toFixed(2)} Secs</span>
                </div>

              </div>

              {/* RAW TERMINAL LOGGER WINDOW */}
              <div className="bg-[#1c221e] border border-sage-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-sage-800/80 mb-4 text-xs font-mono text-gray-400 select-none">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE SESSION OUTPUT LOG
                  </span>
                  <span>UTF-8 standard stream</span>
                </div>

                <div className="font-mono text-xs text-cream-100 space-y-2 h-96 overflow-y-auto leading-relaxed px-1">
                  {logs.map((log, index) => {
                    let badgeColor = "bg-gray-800 text-gray-300 border-gray-700";
                    const agLower = log.agent.toLowerCase();
                    if (agLower.includes("analyzer")) badgeColor = "bg-emerald-800/80 text-emerald-200 border-emerald-705";
                    else if (agLower.includes("planner")) badgeColor = "bg-amber-800/80 text-amber-200 border-amber-705";
                    else if (agLower.includes("budget")) badgeColor = "bg-cyan-800/80 text-cyan-200 border-cyan-705";
                    else if (agLower.includes("substitution")) badgeColor = "bg-purple-800/80 text-purple-200 border-purple-705";

                    const levelClass = 
                      log.level === "success" ? " text-emerald-400 font-bold" :
                      log.level === "warning" ? " text-[#e29738] font-bold" : " text-gray-200";

                    return (
                      <div key={index} className="flex items-start gap-3 py-1 animate-fade-in">
                        <span className="text-gray-500 select-none font-mono text-[10px] pt-1">{log.timestamp}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] border whitespace-nowrap font-mono tracking-tight font-bold shrink-0 ${badgeColor}`}>
                          {log.agent}
                        </span>
                        <span className={`flex-1 ${levelClass}`}>{log.message}</span>
                      </div>
                    );
                  })}
                  {logs.length === 0 && (
                    <div className="text-gray-500 italic text-center py-20 font-mono text-xs">
                      Handshake not started. Press "Trigger Multi-Agent Orchestrator" on any presets block to initialize node channels.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* INITIAL IDLE EMPTY SCREEN (WHEN WORKSPACE STARTS) */}
          {activeScreen === "dashboard" && !orchestrationResult && !isLoading && (
            <div className="max-w-xl mx-auto text-center py-20 px-6 bg-white rounded-2xl border border-cream-200 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sage-500 via-amber-500 to-emerald-500" />
              
              <div className="w-16 h-16 rounded-full bg-[#fdf2e1] text-sage-600 flex items-center justify-center mx-auto mb-4 border border-cream-200">
                <ChefHat className="w-8 h-8 text-[#e2a83e] animate-bounce" />
              </div>

              <h3 className="text-lg font-extrabold text-[#2c302d] tracking-tight">CookFlow AI Chef CRM Workspace</h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto mt-2.5">
                Optimize your active meal planning, grocery expenses, and substitutions. Localized to Indian National Rupees (INR ₹) standards.
              </p>

              {/* Fast Onboarding presets strip */}
              <div className="mt-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-sage-400 block mb-3 font-mono">
                  Pick standard Indian schedule preset:
                </span>
                <div className="flex flex-col gap-2 max-w-xs mx-auto">
                  {INDIAN_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleApplyPreset(p);
                        setActiveScreen("scheduler");
                      }}
                      className="bg-[#faf9f6] text-gray-800 hover:bg-cream-200 border border-cream-300 font-bold px-3 py-2.5 rounded-xl text-xs transition-colors text-left flex justify-between"
                    >
                      <span>{p.label}</span>
                      <span className="text-sage-500">₹{p.budget}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-cream-100 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Info className="w-4 h-4 text-emerald-600" />
                Input screen can be fully customized from the lateral navigation.
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
