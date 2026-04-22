import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Wrench } from "lucide-react";

const purchases = [
  { id: "SL-001", date: "2026-04-08", items: "Brake Pad Set x2", total: 91.98, status: "Completed" },
  { id: "SL-005", date: "2026-03-25", items: "Oil Filter, Air Filter", total: 31.25, status: "Completed" },
  { id: "SL-012", date: "2026-03-10", items: "Spark Plug Set", total: 28.00, status: "Completed" },
];

const services = [
  { id: "SVC-001", date: "2026-03-20", service: "Brake Pad Replacement", status: "Completed", cost: 150 },
  { id: "SVC-003", date: "2026-02-15", service: "Oil Change", status: "Completed", cost: 45 },
  { id: "SVC-005", date: "2026-01-10", service: "General Service Check", status: "Completed", cost: 80 },
];

const HistoryPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="page-title">History</h1>
      <p className="page-subtitle">Your complete purchase and service history</p>
    </div>
    <Tabs defaultValue="purchases">
      <TabsList>
        <TabsTrigger value="purchases" className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Purchases</TabsTrigger>
        <TabsTrigger value="services" className="flex items-center gap-2"><Wrench className="w-4 h-4" /> Services</TabsTrigger>
      </TabsList>
      <TabsContent value="purchases">
        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Date</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell>{p.date}</TableCell>
                    <TableCell>{p.items}</TableCell>
                    <TableCell className="font-medium">${p.total.toFixed(2)}</TableCell>
                    <TableCell><Badge className="bg-success">{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="services">
        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Service #</TableHead><TableHead>Date</TableHead><TableHead>Service</TableHead><TableHead>Cost</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.service}</TableCell>
                    <TableCell className="font-medium">${s.cost}</TableCell>
                    <TableCell><Badge className="bg-success">{s.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default HistoryPage;
