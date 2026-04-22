import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, AlertTriangle, CheckCircle, Info, Loader2, Car, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

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
  High: { icon: <AlertTriangle className="w-5 h-5" />, color: "bg-rose-500/10 text-rose-500 border-rose-500/20", badge: "destructive" as const },
  Medium: { icon: <Info className="w-5 h-5" />, color: "bg-amber-500/10 text-amber-500 border-amber-500/20", badge: "secondary" as const },
  Low: { icon: <CheckCircle className="w-5 h-5" />, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", badge: "default" as const },
};

const PredictionsPage = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const { data } = await api.get('/prediction/my-predictions');
        setPredictions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Predictive Diagnostics</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">AI-Powered Component Failure Forecast</p>
        </div>
        <div className="flex items-center gap-2 p-3 bg-primary/5 border-2 border-primary/10 rounded-xl">
           <Bot className="w-5 h-5 text-primary" />
           <span className="text-[10px] font-black uppercase tracking-widest">Core Engine Analysis Active</span>
        </div>
      </div>

      <Card className="border-2 border-primary/20 rounded-2xl bg-primary/5 overflow-hidden shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
               <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase tracking-tight text-foreground">Advanced Heuristic Monitoring</h3>
              <p className="text-sm font-bold text-muted-foreground mt-1 leading-relaxed">
                Our proprietary AI analyzes your vehicle's telemetry, historical service intervals, and real-world usage patterns to identify potential failure points before they compromise your safety.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {predictions.map((pred) => {
          const config = severityConfig[pred.severity] || severityConfig.Low;
          return (
            <Card key={pred.id} className="border-2 border-border rounded-2xl bg-card hover:bg-muted/30 transition-all shadow-lg overflow-hidden group">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm transition-transform group-hover:scale-110", config.color)}>
                    {config.icon}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                         <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-black text-xl uppercase tracking-tight text-foreground">{pred.part}</h3>
                            <Badge variant={config.badge} className="font-black text-[9px] uppercase px-2 py-0.5">{pred.severity} PRIORITY</Badge>
                         </div>
                         <div className="flex items-center gap-2 text-xs font-black text-primary uppercase">
                            <Car className="w-4 h-4" /> {pred.vehicle}
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">AI Confidence Score</p>
                         <p className="text-xl font-black text-foreground">{pred.confidence}%</p>
                      </div>
                    </div>
                    
                    <div className="h-0.5 bg-border rounded-full w-full" />
                    
                    <p className="text-sm font-bold text-muted-foreground leading-relaxed uppercase opacity-80">{pred.message}</p>
                    
                    <div className="flex items-center justify-between pt-2">
                       <p className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Recommendation: {pred.action}
                       </p>
                       <Button className="h-10 bg-primary text-white font-black text-[10px] px-6 uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10">
                          Deploy Solution
                       </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {predictions.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-border rounded-3xl opacity-50">
             <Bot className="w-12 h-12 text-muted-foreground" />
             <p className="font-black text-sm uppercase tracking-widest text-muted-foreground">No failure predictions detected for current fleet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionsPage;
