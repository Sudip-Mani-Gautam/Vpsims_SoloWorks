import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, CheckCircle } from "lucide-react";
import StatCard from "@/components/StatCard";

const payments = [
  { invoice: "INV-2026-0038", date: "2026-04-10", total: 5500, paid: 5500, remaining: 0, status: "Paid", method: "Cash" },
  { invoice: "INV-2026-0032", date: "2026-04-05", total: 2400, paid: 2400, remaining: 0, status: "Paid", method: "Card" },
  { invoice: "INV-2026-0028", date: "2026-03-28", total: 3200, paid: 1500, remaining: 1700, status: "Partial", method: "Cash" },
  { invoice: "INV-2026-0020", date: "2026-03-15", total: 800, paid: 0, remaining: 800, status: "Credit", method: "Credit" },
];

const PaymentStatusPage = () => {
  const totalPaid = payments.reduce((s, p) => s + p.paid, 0);
  const totalDue = payments.reduce((s, p) => s + p.remaining, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Payment Status</h1>
        <p className="page-subtitle">View your payment history and outstanding balances</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Paid" value={`$${totalPaid.toLocaleString()}`} icon={<CheckCircle className="w-5 h-5" />} trend="All time" trendUp />
        <StatCard title="Amount Due" value={`$${totalDue.toLocaleString()}`} icon={<CreditCard className="w-5 h-5" />} trend={totalDue > 0 ? "Payment pending" : "All clear"} trendUp={totalDue === 0} />
        <StatCard title="Total Invoices" value={payments.length.toString()} icon={<DollarSign className="w-5 h-5" />} />
      </div>
      <Card className="glass-card">
        <CardHeader><CardTitle className="font-heading">Payment Details</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.invoice}>
                  <TableCell className="font-mono font-medium">{p.invoice}</TableCell>
                  <TableCell className="text-muted-foreground">{p.date}</TableCell>
                  <TableCell>${p.total.toFixed(2)}</TableCell>
                  <TableCell className="text-success">${p.paid.toFixed(2)}</TableCell>
                  <TableCell className={p.remaining > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>${p.remaining.toFixed(2)}</TableCell>
                  <TableCell><Badge variant="secondary">{p.method}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      p.status === "Paid" ? "bg-success/10 text-success border-success/30" :
                      p.status === "Credit" ? "bg-destructive/10 text-destructive border-destructive/30" :
                      "bg-warning/10 text-warning border-warning/30"
                    }>{p.status}</Badge>
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

export default PaymentStatusPage;
