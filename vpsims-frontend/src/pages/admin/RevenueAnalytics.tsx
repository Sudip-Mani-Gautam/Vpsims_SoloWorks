import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { 
  DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, 
  ChevronLeft, Filter, Download, PieChart as PieChartIcon, Activity 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(var(--primary))", "hsl(var(--primary) / 0.8)", "hsl(var(--primary) / 0.6)", "hsl(var(--primary) / 0.4)"];

const RevenueAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/dashboard/admin-stats");
        setData(data);
      } catch (error) {
        console.error("Failed to fetch revenue analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center opacity-50 font-bold">CALCULATING REVENUE MATRICES...</div>;

  const trajectory = data?.financialTrajectory || [];
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-border" asChild>
            <Link to="/admin"><ChevronLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Revenue Intelligence</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Monetary Velocity & Fiscal Performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 font-bold text-xs uppercase border-border">
            <Filter className="w-4 h-4 mr-2" /> Filter Period
          </Button>
          <Button className="h-10 font-bold text-xs uppercase bg-primary text-white shadow-lg shadow-primary/20">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-2 border-border shadow-sm p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Collected</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">NPR {data?.totalRevenue?.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <ArrowUpRight className="w-4 h-4" /> 12.5% vs last month
          </div>
        </Card>

        <Card className="bg-card border-2 border-border shadow-sm p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pending Credit</p>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">NPR {data?.unpaidInvoicesAmount?.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
             {data?.unpaidInvoicesCount} invoices outstanding
          </div>
        </Card>

        <Card className="bg-card border-2 border-border shadow-sm p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Transaction</p>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">NPR 4,250</p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
            Stable velocity
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-2 border-border shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted p-6 border-b-2 border-border">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Revenue Growth Trajectory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trajectory}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-black uppercase" />
                <YAxis axisLine={false} tickLine={false} className="text-[10px] font-black" tickFormatter={(v) => `Rs.${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '2px solid hsl(var(--border))', borderRadius: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-2 border-border shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted p-6 border-b-2 border-border">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-primary" /> Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Spare Parts', value: 45 },
                    { name: 'Services', value: 30 },
                    { name: 'Accessories', value: 15 },
                    { name: 'Other', value: 10 },
                  ]}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[0,1,2,3].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 ml-8">
              {[
                { name: 'Spare Parts', val: '45%', color: 'bg-primary' },
                { name: 'Services', val: '30%', color: 'opacity-80 bg-primary' },
                { name: 'Accessories', val: '15%', color: 'opacity-60 bg-primary' },
                { name: 'Other', val: '10%', color: 'opacity-40 bg-primary' },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", item.color)} />
                  <span className="text-xs font-bold text-foreground">{item.name}</span>
                  <span className="text-xs font-black text-muted-foreground ml-auto">{item.val}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
