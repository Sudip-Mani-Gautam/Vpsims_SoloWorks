import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot, Send, Loader2, RefreshCw, AlertTriangle, CheckCircle2, Zap,
  Users, Package, DollarSign, Brain, Sparkles, Key,
  ChevronRight, Shield, BarChart3, Lightbulb, Clock,
  Eye, EyeOff, Check, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const LS_KEY = "vpsims_openrouter_api_key";
const DEFAULT_API_KEY = "";
const FALLBACK_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-v4-flash:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-4-26b-a4b-it:free",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FleetInsight {
  title: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  category: string;
  action: string;
}

const severityConfig = {
  High:   { color: "from-rose-500/15 to-rose-600/5 border-rose-500/25 text-rose-600",   accent: "bg-rose-500",   badge: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800",   icon: <AlertTriangle className="w-4 h-4" /> },
  Medium: { color: "from-amber-500/15 to-amber-600/5 border-amber-500/25 text-amber-600", accent: "bg-amber-500", badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800", icon: <Zap className="w-4 h-4" /> },
  Low:    { color: "from-emerald-500/15 to-emerald-600/5 border-emerald-500/25 text-emerald-600", accent: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800", icon: <CheckCircle2 className="w-4 h-4" /> },
};

const callOpenRouter = async (
  messages: ChatMessage[],
  systemPrompt: string,
  apiKey: string,
  modelOverride?: string
): Promise<string> => {
  const model = modelOverride || FALLBACK_MODELS[0];
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "VPSIMS Admin AI"
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 800,
    })
  });

  if (!res.ok) {
    // Read the body for a real error message
    let errMsg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errMsg = errJson?.error?.message || errJson?.message || errMsg;
    } catch { /* ignore parse errors */ }
    throw new Error(errMsg);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from model");
  return content;
};

// Try each model in FALLBACK_MODELS until one succeeds
const callOpenRouterWithFallback = async (
  messages: ChatMessage[],
  systemPrompt: string,
  apiKey: string
): Promise<string> => {
  let lastErr: Error = new Error("Unknown error");
  for (const model of FALLBACK_MODELS) {
    try {
      return await callOpenRouter(messages, systemPrompt, apiKey, model);
    } catch (e: any) {
      lastErr = e;
      // Only fall through on rate-limit / model-unavailable type errors
      if (e.message?.includes("401") || e.message?.includes("403")) throw e;
      continue;
    }
  }
  throw lastErr;
};

const AdminAIPredictions = () => {
  const [fleetData, setFleetData] = useState<any>(null);
  const [insights, setInsights] = useState<FleetInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // API Key state
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(LS_KEY) || DEFAULT_API_KEY);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keyVerified, setKeyVerified] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);

  const saveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    localStorage.setItem(LS_KEY, trimmed);
    setApiKey(trimmed);
    setApiKeyInput("");
    setShowKeyInput(false);
    setKeyVerified(null);
    toast.success("API key saved successfully.");
  };

  const verifyApiKey = async () => {
    const keyToTest = apiKeyInput.trim() || apiKey;
    if (!keyToTest) return;
    setVerifying(true);
    try {
      await callOpenRouterWithFallback([{ role: "user", content: "ping" }], "Reply with just: ok", keyToTest);
      setKeyVerified(true);
      toast.success("API key is valid ✓");
    } catch {
      setKeyVerified(false);
      toast.error("API key is invalid or expired.");
    } finally {
      setVerifying(false);
    }
  };

  const resetToDefault = () => {
    localStorage.setItem(LS_KEY, DEFAULT_API_KEY);
    setApiKey(DEFAULT_API_KEY);
    setApiKeyInput("");
    setShowKeyInput(false);
    setKeyVerified(null);
    toast.success("Restored default API key.");
  };

  // Fetch fleet-wide data from backend
  const fetchFleetData = async () => {
    setDataLoading(true);
    try {
      const [dashRes] = await Promise.all([
        api.get("/dashboard/admin-stats").catch(() => ({ data: null })),
      ]);
      setFleetData(dashRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  // Generate AI insights using OpenRouter
  const generateInsights = async () => {
    setLoadingInsights(true);
    setInsights([]);
    try {
      const context = fleetData
        ? `Fleet stats: Revenue NPR ${fleetData.totalRevenue?.toLocaleString()}, Inventory units: ${fleetData.totalInventoryUnits}, Active staff: ${fleetData.activePersonnel}, Low stock alerts: ${fleetData.criticalShortages}, Unpaid invoices: ${fleetData.unpaidInvoicesCount}.`
        : "Fleet data unavailable.";

      const systemPrompt = `You are VPSIMS AI — an advanced fleet and vehicle parts management intelligence system for a Nepali auto service company. Analyze the business data and produce exactly 5 actionable predictive insights in strict JSON format. Response must be ONLY a JSON array, no markdown, no explanation.
Format: [{"title":"...","description":"...","severity":"High|Medium|Low","category":"Inventory|Revenue|Fleet|Operations|Customer","action":"..."}]`;

      const response = await callOpenRouterWithFallback(
        [{ role: "user", content: `Analyze this data and give 5 predictive business insights: ${context}` }],
        systemPrompt,
        apiKey
      );

      // Parse JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed: FleetInsight[] = JSON.parse(jsonMatch[0]);
        setInsights(parsed.slice(0, 5));
        toast.success("AI analysis complete — 5 insights generated.");
      } else {
        // Fallback: parse as text insights
        setInsights([{
          title: "AI Analysis Ready",
          description: response.slice(0, 200),
          severity: "Low",
          category: "Operations",
          action: "Review full report"
        }]);
      }
    } catch (err: any) {
      toast.error("AI analysis failed: " + err.message);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Chat with AI
  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const context = fleetData
        ? `Current business context — Revenue: NPR ${fleetData.totalRevenue?.toLocaleString()}, Inventory: ${fleetData.totalInventoryUnits} units, Staff: ${fleetData.activePersonnel}, Low stock: ${fleetData.criticalShortages} alerts, Unpaid invoices: ${fleetData.unpaidInvoicesCount}.`
        : "";

      const systemPrompt = `You are VPSIMS AI Assistant — a smart business intelligence assistant for a vehicle parts and service management company in Nepal. You help the admin with data analysis, predictions, and business decisions. Be concise, professional, and specific. ${context}`;

      const reply = await callOpenRouterWithFallback(updatedMessages, systemPrompt, apiKey);
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      toast.error("Chat failed: " + err.message);
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => { fetchFleetData(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const criticalCount = insights.filter(i => i.severity === "High").length;
  const mediumCount  = insights.filter(i => i.severity === "Medium").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-2">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">AI Business Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Powered by OpenRouter · Fleet-wide analysis & AI assistant</p>
        </div>
        <div className="flex items-center gap-2">
          {dataLoading ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading data...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Data ready
            </span>
          )}
          <Button onClick={generateInsights} disabled={loadingInsights || dataLoading || !apiKey} size="sm" className="gap-2">
            {loadingInsights ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analysing...</> : <><Sparkles className="w-3.5 h-3.5" /> Run AI Scan</>}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchFleetData} disabled={dataLoading} className="h-9 w-9 p-0">
            <RefreshCw className={cn("w-3.5 h-3.5", dataLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* ── API Key Configuration ── */}
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">OpenRouter API Key</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {apiKey
                    ? showKey
                      ? apiKey
                      : `${apiKey.slice(0, 12)}${'•'.repeat(20)}${apiKey.slice(-6)}`
                    : <span className="text-amber-600 font-semibold">No API key configured</span>
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {apiKey && (
                <button
                  onClick={() => setShowKey(v => !v)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showKey ? "Hide" : "Show"}
                </button>
              )}
              <button
                onClick={() => { setShowKeyInput(v => !v); setApiKeyInput(""); setKeyVerified(null); }}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-lg px-2.5 py-1.5 transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                {showKeyInput ? "Cancel" : "Change Key"}
              </button>
              {apiKey !== DEFAULT_API_KEY && (
                <button
                  onClick={resetToDefault}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  Reset Default
                </button>
              )}
            </div>
          </div>

          {/* Key Input Panel */}
          {showKeyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border space-y-3"
            >
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Enter new OpenRouter API key</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={e => { setApiKeyInput(e.target.value); setKeyVerified(null); }}
                    placeholder="sk-or-v1-..."
                    className={cn(
                      "w-full bg-muted/50 border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all pr-10",
                      keyVerified === true ? "border-emerald-500" : keyVerified === false ? "border-red-500" : "border-border"
                    )}
                  />
                  {keyVerified === true && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                  {keyVerified === false && (
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={verifyApiKey}
                  disabled={verifying || !apiKeyInput.trim()}
                  className="h-10 text-xs font-bold shrink-0"
                >
                  {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                </Button>
                <Button
                  onClick={saveApiKey}
                  disabled={!apiKeyInput.trim()}
                  className="h-10 text-xs font-bold shrink-0 gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Get your key at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-primary underline font-semibold">openrouter.ai/keys</a>. The key is saved locally in your browser only.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* ── Fleet Stats ── */}
      {fleetData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Revenue",  value: `NPR ${(fleetData.totalRevenue ?? 0).toLocaleString()}`, icon: <DollarSign className="w-4 h-4" />, color: "text-green-600 bg-green-50 border-green-100" },
            { label: "Inventory Units", value: (fleetData.totalInventoryUnits ?? 0).toLocaleString(), icon: <Package className="w-4 h-4" />, color: "text-blue-600 bg-blue-50 border-blue-100" },
            { label: "Active Staff",   value: (fleetData.activePersonnel ?? 0).toString(),            icon: <Users className="w-4 h-4" />,   color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
            { label: "Stock Alerts",   value: (fleetData.criticalShortages ?? 0).toString(),          icon: <AlertTriangle className="w-4 h-4" />, color: (fleetData.criticalShortages ?? 0) > 0 ? "text-red-600 bg-red-50 border-red-100" : "text-green-600 bg-green-50 border-green-100" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{s.value}</p>
                </div>
                <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center shrink-0", s.color)}>
                  {s.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── AI Insights ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">AI Insights</h2>
          </div>
          {insights.length > 0 && (
            <div className="flex items-center gap-2">
              {criticalCount > 0 && <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">{criticalCount} Critical</span>}
              {mediumCount > 0 && <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">{mediumCount} Medium</span>}
            </div>
          )}
        </div>

        {loadingInsights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 space-y-3">
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-2 bg-muted rounded w-full" />
                  <div className="h-2 bg-muted rounded w-4/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-14 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Brain className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">No insights yet</h3>
                <p className="text-xs text-muted-foreground mt-1">Click <strong>Run AI Scan</strong> to analyze your fleet data</p>
              </div>
              <Button onClick={generateInsights} disabled={dataLoading} size="sm" className="gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Run AI Scan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.map((insight, idx) => {
              const cfg = severityConfig[insight.severity] || severityConfig.Low;
              const dotColor = insight.severity === "High" ? "bg-red-500" : insight.severity === "Medium" ? "bg-amber-500" : "bg-green-500";
              return (
                <Card key={idx} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className={cn("w-1 shrink-0", dotColor)} />
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", cfg.badge)}>{insight.severity}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{insight.category}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground leading-snug">{insight.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                        <div className="pt-1 border-t border-border mt-1">
                          <p className="text-xs font-medium text-primary flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 shrink-0" />{insight.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── AI Chat ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">AI Assistant</h2>
          <span className="text-xs text-muted-foreground ml-1">— ask anything about your business</span>
        </div>

        <Card className="border bg-card shadow-sm">
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">VPSIMS AI Assistant</p>
                  <p className="text-xs text-muted-foreground mt-1">Ask me about revenue trends, inventory predictions, staff performance, or any business insight.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {[
                    "Which parts are likely to run out this month?",
                    "Predict our revenue for next quarter",
                    "What are the top risks to our business?",
                    "How can we improve customer retention?"
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); }}
                      className="text-left text-[11px] font-medium text-muted-foreground hover:text-primary border border-border hover:border-primary/40 rounded-lg px-3 py-2 transition-colors bg-muted/30 hover:bg-primary/5"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}>
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
              placeholder="Ask the AI about your fleet, inventory, revenue..."
              className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              disabled={chatLoading}
            />
            <Button
              onClick={sendChatMessage}
              disabled={chatLoading || !chatInput.trim()}
              className="h-10 w-10 p-0 rounded-xl"
            >
              {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </Card>
      </div>

      {/* ── Quick Tips ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: <Lightbulb className="w-4 h-4" />, title: "Tip", text: "Run AI Scan after refreshing fleet data for the most accurate insights." },
          { icon: <Clock className="w-4 h-4" />,     title: "Scheduled", text: "AI insights are most valuable when run at the start of each business week." },
          { icon: <Shield className="w-4 h-4" />,    title: "Privacy", text: "Data is sent to OpenRouter for analysis. No data is stored externally." },
        ].map((tip, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                {tip.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminAIPredictions;
