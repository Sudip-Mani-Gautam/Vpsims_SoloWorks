import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, CheckCircle2, Loader2, Car,
  Zap, Activity, Clock, Lightbulb,
  Wrench, BarChart3, Shield, Thermometer, Droplets,
  RefreshCw, ChevronRight, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

interface Prediction {
  id: string;
  vehicle: string;
  part: string;
  severity: "High" | "Medium" | "Low";
  message: string;
  action: string;
  confidence: number;
}

const severityConfig = {
  High: {
    label: "Critical",
    icon: AlertTriangle,
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-500",
    bar: "bg-red-500",
    cost: 15000,
  },
  Medium: {
    label: "Warning",
    icon: Zap,
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    cost: 6000,
  },
  Low: {
    label: "Good",
    icon: CheckCircle2,
    badge: "bg-green-100 text-green-700 border border-green-200",
    dot: "bg-green-500",
    bar: "bg-green-500",
    cost: 2000,
  },
};

const PredictionsPage = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [componentWear, setComponentWear] = useState<any[]>([]);
  const [maintenanceTimeline, setMaintenanceTimeline] = useState<any[]>([]);
  const [aiTips, setAiTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPredictions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data } = await api.get("/prediction/my-predictions");
      setPredictions(data.predictions || []);

      const mappedWear = (data.componentWear || []).map((c: any) => ({
        ...c,
        Icon: c.name.includes("Brake") ? Shield :
              c.name.includes("Oil") || c.name.includes("Coolant") ? Droplets :
              c.name.includes("Tyre") ? RefreshCw :
              c.name.includes("Battery") ? Zap : Thermometer,
      }));
      setComponentWear(mappedWear);
      setMaintenanceTimeline(data.maintenanceTimeline || []);

      const mappedTips = (data.aiTips || []).map((t: any) => ({
        ...t,
        Icon: t.severity === "High" ? AlertTriangle :
              t.severity === "Medium" ? Thermometer : Wrench
      }));
      setAiTips(mappedTips);

      if (isRefresh) toast.success("Vehicle scan complete.");
    } catch (err) {
      console.error(err);
      if (isRefresh) toast.error("Failed to refresh data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPredictions(); }, []);

  const criticalCount = predictions.filter(p => p.severity === "High").length;
  const avgConfidence = predictions.length
    ? Math.round(predictions.reduce((a, p) => a + p.confidence, 0) / predictions.length)
    : 0;
  const healthScore = Math.max(0, 100 - criticalCount * 25 - predictions.filter(p => p.severity === "Medium").length * 10);
  const estimatedCost = predictions.reduce((acc, p) => acc + (severityConfig[p.severity]?.cost || 0), 0);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm">Loading vehicle health data...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vehicle Health</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Based on your vehicle usage and service history</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPredictions(true)}
          disabled={refreshing}
          className="gap-2 text-sm"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          {refreshing ? "Scanning..." : "Refresh"}
        </Button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Health */}
        <Card className="col-span-1">
          <CardContent className="p-4 flex flex-col items-center justify-center gap-3">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={healthScore >= 70 ? "#22c55e" : healthScore >= 40 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray="100"
                  strokeDashoffset={100 - healthScore}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold text-foreground">{healthScore}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground">Overall Health</p>
              <p className={cn("text-sm font-semibold", healthScore >= 70 ? "text-green-600" : healthScore >= 40 ? "text-amber-600" : "text-red-600")}>
                {healthScore >= 70 ? "Good" : healthScore >= 40 ? "At Risk" : "Critical"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Critical Issues */}
        <Card className={cn("col-span-1", criticalCount > 0 ? "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900" : "")}>
          <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
            <p className="text-xs text-muted-foreground font-medium">Issues Found</p>
            <div>
              <p className={cn("text-3xl font-bold", criticalCount > 0 ? "text-red-600" : "text-green-600")}>{criticalCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {criticalCount === 0 ? "No critical issues" : "Need attention"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Confidence */}
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
            <p className="text-xs text-muted-foreground font-medium">Scan Confidence</p>
            <div>
              <p className="text-3xl font-bold text-foreground">{avgConfidence}%</p>
              <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${avgConfidence}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimated Cost */}
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
            <p className="text-xs text-muted-foreground font-medium">Est. Repair Cost</p>
            <div>
              <p className="text-2xl font-bold text-foreground">NPR {estimatedCost.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">If left unaddressed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Component Wear ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Component Status</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {componentWear.map((c) => {
            const Icon = c.Icon;
            const barColor = c.status === "Critical" ? "bg-red-500" : c.status === "Warning" ? "bg-amber-500" : c.status === "Monitor" ? "bg-blue-500" : "bg-green-500";
            const badgeColor = c.status === "Critical" ? "bg-red-100 text-red-700 border-red-200" : c.status === "Warning" ? "bg-amber-100 text-amber-700 border-amber-200" : c.status === "Monitor" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-green-100 text-green-700 border-green-200";
            return (
              <Card key={c.name}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                    </div>
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded border", badgeColor)}>{c.status}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Wear</span>
                      <span>{c.wear}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-700", barColor)} style={{ width: `${c.wear}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Upcoming Maintenance ── */}
      {maintenanceTimeline.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Upcoming Maintenance</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              {maintenanceTimeline.map((item, idx) => {
                const cfg = severityConfig[item.severity as keyof typeof severityConfig] || severityConfig.Low;
                return (
                  <div key={item.label} className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Due in {item.due} {item.unit}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", cfg.bar)} style={{ width: `${Math.max(5, 100 - item.due)}%` }} />
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Tips ── */}
      {aiTips.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiTips.map((tip, idx) => {
              const Icon = tip.Icon;
              const color = tip.severity === "High" ? "text-red-600 bg-red-50 dark:bg-red-950/30" :
                            tip.severity === "Medium" ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30" :
                            "text-green-600 bg-green-50 dark:bg-green-950/30";
              return (
                <Card key={idx} className="border">
                  <CardContent className="p-4 flex gap-3 items-start">
                    <div className={cn("w-8 h-8 rounded-md flex items-center justify-center shrink-0", color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{tip.tip}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Alerts / Forecasted Issues ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Forecasted Issues</h2>
        </div>

        {predictions.length === 0 ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">All Clear</h3>
                <p className="text-sm text-muted-foreground mt-1">No issues detected in your vehicle at this time.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {predictions.map((pred) => {
              const config = severityConfig[pred.severity] || severityConfig.Low;
              const Icon = config.icon;
              return (
                <Card key={pred.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      {/* Severity strip */}
                      <div className={cn("w-1 shrink-0", config.dot)} />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", config.badge)}>
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-semibold text-foreground">{pred.part}</h3>
                                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded border", config.badge)}>
                                  {config.label}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <Car className="w-3 h-3" /> {pred.vehicle}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{pred.message}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-foreground">{pred.confidence}%</p>
                            <p className="text-xs text-muted-foreground">confidence</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Recommended: </span>{pred.action}</p>
                          <Button size="sm" className="shrink-0 h-7 text-xs px-3">
                            Book Service
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default PredictionsPage;
