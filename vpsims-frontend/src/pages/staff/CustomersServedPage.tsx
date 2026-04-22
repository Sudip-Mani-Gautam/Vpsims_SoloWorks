import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  Users, Search, Loader2, Mail, Phone, 
  ChevronRight, ArrowLeft, History 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from 'react-router-dom';

interface CustomerActivity {
  userId: number;
  name: string;
  email: string;
  phone: string;
  lastOrderValue: number;
  orderCount: number;
  lastOrderTime: string;
}

const CustomersServedPage = () => {
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadActivities = async () => {
    try {
      const res = await api.get('/order');
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = res.data.filter((o: any) => o.createdAt.startsWith(today));
      
      // Group by user
      const userMap: Record<number, CustomerActivity> = {};
      todayOrders.forEach((o: any) => {
          if (!userMap[o.userId]) {
              userMap[o.userId] = {
                  userId: o.userId,
                  name: o.customerName || "Walk-in Customer",
                  email: o.userEmail || "N/A",
                  phone: o.userPhone || "N/A",
                  lastOrderValue: 0,
                  orderCount: 0,
                  lastOrderTime: o.createdAt
              };
          }
          userMap[o.userId].orderCount += 1;
          userMap[o.userId].lastOrderValue += o.totalAmount;
          if (new Date(o.createdAt) > new Date(userMap[o.userId].lastOrderTime)) {
              userMap[o.userId].lastOrderTime = o.createdAt;
          }
      });
      
      setActivities(Object.values(userMap));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadActivities(); }, []);

  const filtered = activities.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/staff"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-foreground">Customers Served</h1>
          <p className="text-muted-foreground font-medium">Daily record of active customer entities today</p>
        </div>
      </div>

      <Card className="glass-card shadow-xl overflow-hidden border-border/40">
        <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> Active Traffic Log
                </CardTitle>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9 bg-background/50" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 text-xs font-black uppercase">Account Holder</TableHead>
                <TableHead className="text-xs font-black uppercase">Contact Comms</TableHead>
                <TableHead className="text-xs font-black uppercase text-center">Engagement</TableHead>
                <TableHead className="text-xs font-black uppercase">Total Spent (NPR)</TableHead>
                <TableHead className="text-xs font-black uppercase">Last Transaction</TableHead>
                <TableHead className="text-right pr-6 text-xs font-black uppercase">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-64 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-64 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">No customer activity detected today</TableCell></TableRow>
              ) : filtered.map((a) => (
                <TableRow key={a.userId} className="group">
                  <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                              {a.name[0]}
                          </div>
                          <span className="font-black text-foreground">{a.name}</span>
                      </div>
                  </TableCell>
                  <TableCell>
                      <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <Mail className="w-3 h-3" /> {a.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <Phone className="w-3 h-3" /> {a.phone}
                          </div>
                      </div>
                  </TableCell>
                  <TableCell className="text-center font-black tabular-nums">
                      {a.orderCount} Orders
                  </TableCell>
                  <TableCell className="font-black tabular-nums text-foreground">
                      Rs. {a.lastOrderValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">
                      {new Date(a.lastOrderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] font-bold uppercase">
                          <Link to={`/staff/customers/${a.userId}`}>Account Profile <ChevronRight className="w-3 h-3 ml-1" /></Link>
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersServedPage;
