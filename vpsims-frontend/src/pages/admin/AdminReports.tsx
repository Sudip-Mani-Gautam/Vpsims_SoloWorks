import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie } from "recharts";
import { TrendingUp, DollarSign, Package, Users, ShoppingCart, Loader2, AlertCircle } from "lucide-react";
import StatCard from "@/components/StatCard";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const COLORS = ["hsl(220,70%,45%)", "hsl(35,95%,55%)", "hsl(160,60%,40%)", "hsl(0,72%,51%)", "hsl(280,60%,50%)"];

const AdminReports = () => {
  const [period, setPeriod] = useState("monthly");
  const [stats, setStats] = useState<any>(null);
  const [topSpenders, setTopSpenders] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, spendersRes, overdueRes, stockRes] = await Promise.all([
        api.get('/reports/revenue-stats'),
        api.get('/reports/top-spenders'),
        api.get('/reports/overdue-credits'),
        api.get('/reports/low-stock'),
      ]);
      setStats(statsRes.data);
      setTopSpenders(spendersRes.data);
      setOverdue(overdueRes.data);
      setLowStock(stockRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
    </div>
  );

  // Simulated chart data based on stats
  const revenueChartData = [
    { name: 'Today', value: stats?.daily || 0 },
    { name: 'This Month', value: stats?.monthly || 0 },
    { name: 'This Year', value: stats?.yearly || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Financial Intelligence</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Cross-Dimensional Performance Analytics</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44 h-11 border-2 border-border rounded-xl font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="daily" className="text-xs font-bold uppercase">Daily Report</SelectItem>
            <SelectItem value="weekly" className="text-xs font-bold uppercase">Weekly Metrics</SelectItem>
            <SelectItem value="monthly" className="text-xs font-bold uppercase">Monthly Summary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Daily Revenue" value={`Rs. ${(stats?.daily || 0).toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} trend="Current 24h" trendUp />
        <StatCard title="Monthly Total" value={`Rs. ${(stats?.monthly || 0).toLocaleString()}`} icon={<TrendingUp className="w-5 h-5" />} trend="Month-to-date" trendUp />
        <StatCard title="Yearly Revenue" value={`Rs. ${(stats?.yearly || 0).toLocaleString()}`} icon={<ShoppingCart className="w-5 h-5" />} trend="Fiscal Year" trendUp />
        <StatCard title="Low Stock Alerts" value={lowStock.length.toString()} icon={<Package className="w-5 h-5" />} trend="Critical Units" trendUp={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-2 border-border rounded-2xl bg-card shadow-xl overflow-hidden">
          <CardHeader className="bg-muted p-6 border-b-2 border-border">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-primary" /> Revenue Velocity Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-black uppercase" />
                <YAxis axisLine={false} tickLine={false} className="text-[10px] font-black" />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '2px solid hsl(var(--border))', borderRadius: '12px' }}
                   itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-2 border-border rounded-2xl bg-card shadow-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-muted p-6 border-b-2 border-border">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
               <AlertCircle className="w-4 h-4 text-destructive" /> Critical Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto max-h-[400px]">
             <Table>
                <TableBody>
                   {lowStock.map((p, i) => (
                      <TableRow key={i} className="border-b border-border h-14">
                         <TableCell className="pl-6">
                            <p className="text-sm font-black uppercase tracking-tight">{p.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Inventory Alert</p>
                         </TableCell>
                         <TableCell className="text-right pr-6">
                            <Badge variant="destructive" className="font-black text-[10px] uppercase">{p.stockQuantity} UNITS</Badge>
                         </TableCell>
                      </TableRow>
                   ))}
                   {lowStock.length === 0 && (
                      <TableRow><TableCell className="h-40 text-center text-muted-foreground font-bold">No Critical Alerts</TableCell></TableRow>
                   )}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-2 border-border rounded-2xl bg-card shadow-xl overflow-hidden">
          <CardHeader className="bg-muted p-6 border-b-2 border-border">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Top Revenue Generators</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="pl-6 text-[10px] font-black uppercase">Entity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Orders</TableHead>
                  <TableHead className="text-right pr-6 text-[10px] font-black uppercase">Total NPR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSpenders.map((c, i) => (
                  <TableRow key={i} className="border-b border-border h-14">
                    <TableCell className="pl-6 font-black uppercase text-sm">{c.name}</TableCell>
                    <TableCell className="font-bold text-sm">{c.purchases}</TableCell>
                    <TableCell className="text-right pr-6 font-black text-sm text-primary">Rs. {c.spent.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-2 border-border rounded-2xl bg-card shadow-xl overflow-hidden">
          <CardHeader className="bg-muted p-6 border-b-2 border-border">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-destructive">Pending Credit Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="pl-6 text-[10px] font-black uppercase">Debtor</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Overdue</TableHead>
                  <TableHead className="text-right pr-6 text-[10px] font-black uppercase">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdue.map((o, i) => (
                  <TableRow key={i} className="border-b border-border h-14">
                    <TableCell className="pl-6 font-black uppercase text-sm">{o.name}</TableCell>
                    <TableCell className="font-bold text-xs text-destructive uppercase">{o.daysPast} Days Past</TableCell>
                    <TableCell className="text-right pr-6 font-black text-sm text-destructive">Rs. {o.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {overdue.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="h-40 text-center text-muted-foreground font-bold">Clear Ledger</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
