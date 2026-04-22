import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, Users, FileText, Search, 
  ChevronRight, PlusCircle, UserPlus, 
  CreditCard, PackageSearch, Zap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const recentSales = [
  { customer: "Bikash Rai",    parts: "Brake Pad Set",  amount: 91.98, date: "Today" },
  { customer: "Anita Gurung",  parts: "Oil Filter x2",  amount: 25.00, date: "Today" },
  { customer: "Prabin KC",     parts: "Spark Plug Set", amount: 28.00, date: "Yesterday" },
];

const weeklyData = [
  { day: "Mon", sales: 320 }, { day: "Tue", sales: 450 }, { day: "Wed", sales: 280 },
  { day: "Thu", sales: 590 }, { day: "Fri", sales: 680 }, { day: "Sat", sales: 820 },
];

const QuickAction = ({ icon: Icon, label, description, to, color }: { icon: any, label: string, description: string, to: string, color: string }) => (
    <Link to={to} className="group relative overflow-hidden glass-card hover:border-primary/50 transition-all p-4 flex flex-col gap-3 hover-lift shadow-lg">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm font-black text-foreground uppercase tracking-wider">{label}</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase">{description}</p>
        </div>
        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-4 h-4 text-primary" />
        </div>
    </Link>
);

const StaffDashboard = () => (
  <div className="space-y-8">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-heading font-black tracking-tighter text-foreground">OPERATIONS HUB</h1>
        <p className="text-muted-foreground font-semibold uppercase tracking-[0.2em] text-[10px]">VPSIMS Distribution Control • Staff Sector</p>
      </div>
      <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse mx-2" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pr-3">System Online</span>
      </div>
    </div>

    {/* Quick Actions Section */}
    <section>
        <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">Quick Operations</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction 
                to="/staff/sales" 
                icon={PlusCircle} 
                label="New Sale" 
                description="Initialize Transaction" 
                color="bg-primary/10 text-primary" 
            />
            <QuickAction 
                to="/staff/customers" 
                icon={UserPlus} 
                label="Register" 
                description="Add New Customer" 
                color="bg-info/10 text-info" 
            />
            <QuickAction 
                to="/staff/search" 
                icon={PackageSearch} 
                label="Catalog" 
                description="Inventory Lookup" 
                color="bg-warning/10 text-warning" 
            />
            <QuickAction 
                to="/staff/credits" 
                icon={CreditCard} 
                label="Payment" 
                description="Mark Credit Paid" 
                color="bg-success/10 text-success" 
            />
        </div>
    </section>

    {/* Metrics Section */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Link to="/staff/todays-sales" className="block">
        <StatCard title="Today's Sales"    value="$345" icon={<ShoppingCart className="w-4 h-4" />} trend="8 trans" trendUp variant="success" />
      </Link>
      <Link to="/staff/customers-served" className="block">
        <StatCard title="Customers Served" value="12"   icon={<Users className="w-4 h-4" />} variant="primary" />
      </Link>
      <Link to="/staff/invoices-created" className="block">
        <StatCard title="Invoices Created" value="8"    icon={<FileText className="w-4 h-4" />} variant="info" />
      </Link>
      <StatCard title="Searches Made"   value="24"   icon={<Search className="w-4 h-4" />} variant="warning" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card shadow-2xl border-border/40">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card shadow-2xl border-border/40 overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Recent Transactions</CardTitle>
          <Link to="/staff/sales" className="text-[10px] font-black uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {recentSales.map((sale, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-black text-foreground">{sale.customer}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{sale.parts}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">Rs. {sale.amount.toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{sale.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default StaffDashboard;
