import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy, Clock, CreditCard, Loader2, TrendingUp,
  BarChart3, AlertTriangle, CheckCircle2, Medal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Spender { name: string; spent: number; purchases: number; }
interface Overdue { name: string; amount: number; daysPast: number; invoiceId: number; }

const rankGradients = [
  "from-yellow-400 to-amber-500",
  "from-slate-300 to-slate-400",
  "from-amber-600 to-amber-700",
];

const rankBg = [
  "bg-amber-500/10 border-amber-500/20",
  "bg-slate-500/10 border-slate-500/20",
  "bg-amber-700/10 border-amber-700/20",
];

const StaffReports = () => {
  const { data: topSpenders = [], isLoading: loadingSpenders } = useQuery<Spender[]>({
    queryKey: ['top-spenders'],
    queryFn: async () => { const { data } = await api.get('/reports/top-spenders'); return data; }
  });

  const { data: overdueCredits = [], isLoading: loadingCredits } = useQuery<Overdue[]>({
    queryKey: ['overdue-credits'],
    queryFn: async () => { const { data } = await api.get('/reports/overdue-credits'); return data; }
  });

  const totalOverdue = overdueCredits.reduce((s, c) => s + c.amount, 0);
  const totalSpent = topSpenders.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-1">Analytics</p>
          <h1 className="text-3xl font-heading font-black tracking-tight text-foreground leading-none">Customer Reports</h1>
          <p className="text-[11px] font-semibold text-muted-foreground mt-1">Top value accounts and overdue credit monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted/40 border border-border/50 px-3.5 py-2 rounded-full">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold text-muted-foreground">Live Report</span>
          </div>
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Top Spenders", value: topSpenders.length.toString(), icon: Trophy, color: "bg-amber-500" },
          { label: "Total Revenue", value: `Rs. ${totalSpent.toLocaleString()}`, icon: TrendingUp, color: "bg-blue-500" },
          { label: "Overdue Accounts", value: overdueCredits.length.toString(), icon: AlertTriangle, color: overdueCredits.length > 0 ? "bg-red-500" : "bg-emerald-500" },
          { label: "Overdue Amount", value: overdueCredits.length > 0 ? `Rs. ${totalOverdue.toLocaleString()}` : "Clear", icon: overdueCredits.length > 0 ? CreditCard : CheckCircle2, color: overdueCredits.length > 0 ? "bg-rose-500" : "bg-emerald-500" },
        ].map((s, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</span>
              <div className={`w-8 h-8 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-xl font-black text-foreground leading-none">{s.value}</p>
            <div className={`absolute bottom-0 right-0 w-16 h-16 rounded-full ${s.color} opacity-5 translate-x-5 translate-y-5`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Elite Spenders */}
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 py-4 px-5 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
              </div>
              Elite Spenders
            </CardTitle>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
              {topSpenders.length} accounts
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {loadingSpenders ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary opacity-50" />
              </div>
            ) : topSpenders.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground italic text-sm">No spending data available.</div>
            ) : (
              <div className="divide-y divide-border/30">
                {topSpenders.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group">
                    {/* Rank badge */}
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border",
                      i < 3 ? rankBg[i] : "bg-muted/40 border-border/40"
                    )}>
                      {i < 3
                        ? <Medal className={cn("w-4 h-4", i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : "text-amber-700")} />
                        : <span className="text-[11px] font-black text-muted-foreground">#{i + 1}</span>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[13px] text-foreground truncate">{c.name}</p>
                      <p className="text-[10px] font-semibold text-muted-foreground">{c.purchases} transactions</p>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-[13px] text-foreground">Rs. {c.spent.toLocaleString()}</p>
                      {c.spent >= 5000 && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] font-black uppercase py-0 px-2 mt-0.5">
                          Loyalty Tier
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Credit Log */}
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 py-4 px-5 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-red-500/15 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-red-500" />
              </div>
              Overdue Credits
            </CardTitle>
            <span className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-full",
              overdueCredits.length > 0
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}>
              {overdueCredits.length > 0 ? `${overdueCredits.length} overdue` : "All clear"}
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {loadingCredits ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary opacity-50" />
              </div>
            ) : overdueCredits.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="font-black text-emerald-600 dark:text-emerald-400">Registry Clear</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">No overdue credits found.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {overdueCredits.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-red-500/5 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-black text-red-500">{c.name[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[13px] text-foreground truncate">{c.name}</p>
                      <p className="text-[10px] font-semibold text-red-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {c.daysPast} days overdue · INV-{c.invoiceId.toString().padStart(6, '0')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-[13px] text-red-500">Rs. {c.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffReports;
