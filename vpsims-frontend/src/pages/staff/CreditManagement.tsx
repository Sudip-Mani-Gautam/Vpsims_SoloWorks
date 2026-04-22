import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  CreditCard, 
  AlertTriangle, 
  Mail, 
  Search, 
  CheckCircle, 
  Send, 
  ShieldCheck, 
  X, 
  RotateCcw,
  ChevronDown
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreditRecord {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  invoiceNo: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: "pending" | "overdue" | "paid";
}

const initialCredits: CreditRecord[] = [
  { id: "CR001", customerId: "C001", customerName: "Bikash Rai",  email: "bikash.rai@example.com",  phone: "9801111111", invoiceNo: "INV-2025-042", amount: 150.00, dueDate: "2025-04-10", daysOverdue: 0, status: "pending" },
  { id: "CR002", customerId: "C002", customerName: "Anita Gurung", email: "anita.g@vpsims.com",      phone: "9802222222", invoiceNo: "INV-2025-028", amount: 450.00, dueDate: "2025-02-15", daysOverdue: 52, status: "overdue" },
  { id: "CR003", customerId: "C005", customerName: "Suman Thapa",  email: "suman.thapa@gmail.com",  phone: "9805555555", invoiceNo: "INV-2025-019", amount: 320.00, dueDate: "2025-01-20", daysOverdue: 78, status: "overdue" },
  { id: "CR004", customerId: "C003", customerName: "Prabin KC",    email: "prabin.kc@outlook.com",  phone: "9803333333", invoiceNo: "INV-2025-035", amount: 85.00,  dueDate: "2025-03-25", daysOverdue: 14, status: "pending" },
  { id: "CR005", customerId: "C007", customerName: "Deepa Sharma", email: "deepa.sharma@vpsims.com", phone: "9807777777", invoiceNo: "INV-2024-098", amount: 1200.00, dueDate: "2024-12-01", daysOverdue: 128, status: "overdue" },
];

const CreditManagement = () => {
  const [credits, setCredits] = useState<CreditRecord[]>(initialCredits);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordToConfirm, setRecordToConfirm] = useState<CreditRecord | null>(null);
  const [lastUpdatedId, setLastUpdatedId] = useState<string | null>(null);
  const lastAction = useRef<{ id: string; prevStatus: CreditRecord["status"] } | null>(null);

  const filtered = credits.filter((c) =>
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = credits.filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0);
  const totalOverdue = credits.filter((c) => c.status === "overdue").reduce((s, c) => s + c.amount, 0);
  const overdueCount = credits.filter((c) => c.status === "overdue").length;

  const handleSendReminder = (record: CreditRecord) => {
    toast.success(`Payment reminder sent to ${record.email}`);
  };

  const handleSendInvoice = (record: CreditRecord) => {
    toast.success(`Digital receipt dispatched to ${record.email}`);
  };

  const undoLastAction = () => {
    if (lastAction.current) {
      const { id, prevStatus } = lastAction.current;
      setCredits(prev => prev.map(c => c.id === id ? { ...c, status: prevStatus } : c));
      toast.info("Action undone. Credit status restored.");
      lastAction.current = null;
      setLastUpdatedId(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const record = credits.find(c => c.id === id);
    if (!record) return;

    if (newStatus === "paid") {
      setRecordToConfirm(record);
      return;
    }

    // Normal status update
    setCredits(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
    toast.info(`Status updated to ${newStatus}`);
  };

  const confirmMarkPaid = () => {
    if (!recordToConfirm) return;
    const { id } = recordToConfirm;
    
    lastAction.current = { id, prevStatus: recordToConfirm.status };
    setLastUpdatedId(id);
    
    setCredits(prev => prev.map((c) => c.id === id ? { ...c, status: "paid" as const } : c));
    handleSendInvoice({ ...recordToConfirm, status: "paid" });
    
    toast.success("Payment confirmed successfully!", {
      description: `Receipt sent to ${recordToConfirm.email}`,
      action: {
        label: "Undo",
        onClick: undoLastAction,
      },
    });

    setRecordToConfirm(null);
    setTimeout(() => {
      setLastUpdatedId(prev => prev === id ? null : prev);
    }, 10000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-3xl font-heading font-black tracking-tight">Payment Management</h1>
        <p className="page-subtitle text-muted-foreground font-medium">Track and manage customer payments and overdue credit balances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Pending" value={`NPR ${totalPending.toLocaleString()}`} icon={<CreditCard className="w-5 h-5" />} trend="neutral" />
        <StatCard title="Total Overdue" value={`NPR ${totalOverdue.toLocaleString()}`} icon={<AlertTriangle className="w-5 h-5" />} trend="down" />
        <StatCard title="Overdue Customers" value={overdueCount.toString()} icon={<Mail className="w-5 h-5" />} trend="down" />
      </div>

      <Card className="glass-card shadow-xl border-border/40 overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div>
            <CardTitle className="text-xl font-heading font-bold">Credit Ledger</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Synchronized customer debt monitoring system</p>
          </div>
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input className="pl-9 h-10 bg-background/50 border-border/50 focus:border-primary transition-all" placeholder="Search by Reference or Account Holder..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase pl-6">Customer Persona</TableHead>
                <TableHead className="font-bold text-xs uppercase">Email Address</TableHead>
                <TableHead className="font-bold text-xs uppercase">Invoice Ref</TableHead>
                <TableHead className="font-bold text-xs uppercase">Amount (NPR)</TableHead>
                <TableHead className="font-bold text-xs uppercase">Due Date</TableHead>
                <TableHead className="font-bold text-xs uppercase">Overdue</TableHead>
                <TableHead className="font-bold text-xs uppercase text-center">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase text-right pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className={cn("hover:bg-muted/20 transition-colors", c.daysOverdue > 30 ? "bg-destructive/5" : "")}>
                  <TableCell className="pl-6">
                    <div className="font-black text-foreground">{c.customerName}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        {c.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Mail className="w-3 h-3" /> {c.email}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-black text-primary">{c.invoiceNo}</TableCell>
                  <TableCell className="font-black tabular-nums text-foreground">Rs. {c.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground">{c.dueDate}</TableCell>
                  <TableCell>
                    {c.daysOverdue > 0 ? (
                      <Badge variant="outline" className={cn("font-black text-[10px] uppercase", c.daysOverdue > 30 ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-warning/10 text-warning border-warning/30")}>
                        {c.daysOverdue} days
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Current</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                        <Select value={c.status} onValueChange={(val) => handleStatusChange(c.id, val)}>
                            <SelectTrigger className={cn(
                                "w-[110px] h-8 text-[10px] font-black uppercase tracking-wider border-none shadow-sm",
                                c.status === "paid" ? "bg-success/10 text-success" : 
                                c.status === "overdue" ? "bg-destructive/10 text-destructive" : 
                                "bg-warning/10 text-warning"
                            )}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-border/50">
                                <SelectItem value="pending" className="text-[10px] font-bold uppercase text-warning">Pending</SelectItem>
                                <SelectItem value="overdue" className="text-[10px] font-bold uppercase text-destructive">Overdue</SelectItem>
                                <SelectItem value="paid" className="text-[10px] font-bold uppercase text-success">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        {lastUpdatedId === c.id && (
                            <button 
                                onClick={undoLastAction}
                                className="flex items-center gap-1 text-[9px] font-black text-primary hover:underline animate-pulse"
                            >
                                <RotateCcw className="w-2.5 h-2.5" /> UNDO MISTAKE
                            </button>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1.5">
                      {c.status === "paid" ? (
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase text-primary hover:bg-primary/10 transition-colors" onClick={() => handleSendInvoice(c)}>
                            <Send className="w-3.5 h-3.5 mr-1" /> Send Email
                        </Button>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase text-warning hover:bg-warning/10 transition-colors" onClick={() => handleSendReminder(c)}>
                            <Mail className="w-3.5 h-3.5 mr-1" /> Remind
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase text-success hover:bg-success/10 transition-colors" onClick={() => setRecordToConfirm(c)}>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Paid
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!recordToConfirm} onOpenChange={(open) => !open && setRecordToConfirm(null)}>
        <AlertDialogContent className="glass-card border-border/50 shadow-2xl max-w-md">
          <AlertDialogHeader className="items-center text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4 border border-success/20">
              <ShieldCheck className="w-8 h-8 text-success" />
            </div>
            <AlertDialogTitle className="text-2xl font-heading font-black text-foreground">Verify Transaction</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Are you sure you want to mark the credit for <span className="text-foreground font-black">{recordToConfirm?.customerName}</span> as <span className="text-success font-black">PAID</span>?
              <br /><br />
              This will finalize the ledger and automatically dispatch a digital receipt to <span className="text-primary underline underline-offset-4">{recordToConfirm?.email}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:justify-center mt-6">
            <AlertDialogCancel className="flex-1 h-11 border-border/50 hover:bg-muted font-bold text-[10px] uppercase tracking-widest transition-all">
                <X className="w-4 h-4 mr-2" /> Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmMarkPaid} className="flex-1 h-11 bg-success hover:bg-success/90 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-success/20 transition-all border-none">
                <CheckCircle className="w-4 h-4 mr-2" /> Confirm Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreditManagement;
