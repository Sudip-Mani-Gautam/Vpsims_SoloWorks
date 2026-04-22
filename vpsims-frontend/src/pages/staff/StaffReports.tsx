import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, CreditCard, Loader2 } from "lucide-react";

interface Spender {
  name: string;
  spent: number;
  purchases: number;
}

interface Overdue {
  name: string;
  amount: number;
  daysPast: number;
  invoiceId: number;
}

const StaffReports = () => {
  const { data: topSpenders = [], isLoading: loadingSpenders } = useQuery<Spender[]>({
    queryKey: ['top-spenders'],
    queryFn: async () => {
      const { data } = await api.get('/reports/top-spenders');
      return data;
    }
  });

  const { data: overdueCredits = [], isLoading: loadingCredits } = useQuery<Overdue[]>({
    queryKey: ['overdue-credits'],
    queryFn: async () => {
      const { data } = await api.get('/reports/overdue-credits');
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-heading font-black tracking-tight text-foreground">Customer Distribution Reports</h1>
        <p className="text-muted-foreground font-medium">Top value accounts and synchronized overdue credit monitoring.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card shadow-xl border-border/40 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="font-heading font-bold flex items-center gap-3 text-lg">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-warning" />
              </div>
              Elite Spenders
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {loadingSpenders ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary opacity-50" />
                </div>
              ) : topSpenders.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground italic">No spending data in the current cycle.</p>
              ) : topSpenders.map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all group">
                  <span className="text-xl font-black text-muted-foreground/30 group-hover:text-primary/40 transition-colors w-8">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-black text-foreground">{c.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{c.purchases} Successful Transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-black text-foreground">Rs. {c.spent.toLocaleString()}</p>
                    {c.spent >= 5000 && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase py-0 px-2 mt-1">Loyalty Tier</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-xl border-border/40 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="font-heading font-bold flex items-center gap-3 text-lg">
               <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-destructive" />
              </div>
              Overdue Credit Log (1+ Month)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
               {loadingCredits ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary opacity-50" />
                </div>
              ) : overdueCredits.length === 0 ? (
                <div className="py-12 text-center bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <p className="text-emerald-500 font-bold">Registry Clear: No overdue credits found.</p>
                </div>
              ) : overdueCredits.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-all">
                  <div>
                    <p className="font-black text-foreground">{c.name}</p>
                    <p className="text-[10px] font-bold text-destructive uppercase flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3" /> {c.daysPast} Units Overdue
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-black text-destructive">Rs. {c.amount.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">INV-{c.invoiceId.toString().padStart(6, '0')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffReports;
