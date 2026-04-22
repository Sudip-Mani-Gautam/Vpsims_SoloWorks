import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, AlertTriangle, Loader2, Mail, RotateCcw, CheckCircle, Clock } from "lucide-react";
import StatCard from "@/components/StatCard";
import { toast } from "sonner";

interface Order {
  id: number;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  amountPaid: number;
  createdAt: string;
}

const PaymentManagement = () => {
    const queryClient = useQueryClient();

    const { data: orders = [], isLoading } = useQuery<Order[]>({
        queryKey: ['admin-payments'],
        queryFn: async () => {
          const { data } = await api.get('/order');
          return data;
        }
    });

    const payMutation = useMutation({
        mutationFn: (id: number) => {
            const order = orders.find(o => o.id === id);
            return api.patch(`/order/${id}/payment`, { 
                paymentStatus: 'Paid', 
                amountPaid: order?.totalAmount 
            });
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
          toast.success("Transaction Liquidated", { description: "Payment status synchronized to Paid." });
        }
    });

    const revertMutation = useMutation({
        mutationFn: (id: number) => {
            return api.patch(`/order/${id}/payment`, { 
                paymentStatus: 'Credit', 
                amountPaid: 0 
            });
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
          toast.warning("Payment Reverted", { description: "Invoice status reset to Credit (Unmarked)." });
        }
    });

    const emailMutation = useMutation({
        mutationFn: (id: number) => api.post(`/order/${id}/send-invoice`),
        onSuccess: () => {
          toast.success("Invoice Dispatched", { description: "Verified receipt sent to the account holder." });
        }
    });

    const totalCollected = orders.reduce((s, o) => s + o.amountPaid, 0);
    const totalDue = orders.reduce((s, o) => s + (o.totalAmount - o.amountPaid), 0);
    const overdueCount = orders.filter(o => o.paymentStatus !== "Paid").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-heading font-black tracking-tight text-foreground">Global Payment System</h1>
                    <p className="text-muted-foreground font-medium">Coordinate institutional cash flows and manage customer credit states.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Collected" 
                    value={`Rs. ${totalCollected.toLocaleString()}`} 
                    icon={<DollarSign className="w-5 h-5 text-emerald-500" />} 
                    trend="Synchronized" 
                    trendUp 
                />
                <StatCard 
                    title="Outstanding Debt" 
                    value={`Rs. ${totalDue.toLocaleString()}`} 
                    icon={<CreditCard className="w-5 h-5 text-destructive" />} 
                    trend="Needs Collection" 
                    trendUp={false} 
                />
                <StatCard 
                    title="Pending Closures" 
                    value={overdueCount.toString()} 
                    icon={<AlertTriangle className="w-5 h-5 text-warning" />} 
                    trend="Critical Path" 
                    trendUp={false} 
                />
            </div>

            <Card className="glass-card shadow-xl border-border/40 overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="font-bold text-xs uppercase pl-6 py-4">Reference</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Entity</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Total Value</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Paid</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Remaining</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-center">Ledger Status</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto opacity-50" />
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center text-muted-foreground">
                                        No financial entries found in the local cluster.
                                    </TableCell>
                                </TableRow>
                            ) : orders.map((o) => (
                                <TableRow key={o.id} className="hover:bg-muted/20 transition-colors group">
                                    <TableCell className="pl-6 font-black font-mono text-primary text-xs tracking-widest">
                                        INV-{o.id.toString().padStart(6, '0')}
                                    </TableCell>
                                    <TableCell className="font-black text-foreground">{o.customerName}</TableCell>
                                    <TableCell className="font-bold tabular-nums text-foreground">Rs. {o.totalAmount.toLocaleString()}</TableCell>
                                    <TableCell className="text-emerald-500 font-bold tabular-nums">Rs. {o.amountPaid.toLocaleString()}</TableCell>
                                    <TableCell className={`font-black tabular-nums ${o.totalAmount - o.amountPaid > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                        Rs. {(o.totalAmount - o.amountPaid).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            <Badge variant="outline" className={`font-black text-[9px] uppercase px-3 py-1 flex items-center gap-1.5 ${
                                                o.paymentStatus === "Paid" 
                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                                    : "bg-warning/5 text-warning border-warning/30"
                                            }`}>
                                                {o.paymentStatus === "Paid" ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                                {o.paymentStatus}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 px-3 text-[10px] font-black uppercase hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-30 disabled:grayscale"
                                                onClick={() => emailMutation.mutate(o.id)}
                                                disabled={emailMutation.isPending || o.paymentStatus === "Paid"}
                                            >
                                                <Mail className="w-3.5 h-3.5 mr-1" /> Email
                                            </Button>
                                            
                                            {o.paymentStatus === "Paid" ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost"
                                                    className="h-8 px-3 text-[10px] font-black uppercase text-destructive hover:bg-destructive/10 transition-colors"
                                                    onClick={() => revertMutation.mutate(o.id)}
                                                    disabled={revertMutation.isPending}
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Revert (Unmark)
                                                </Button>
                                            ) : (
                                                <Button 
                                                    size="sm" 
                                                    className="h-8 px-4 text-[10px] font-black uppercase bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover-lift"
                                                    onClick={() => payMutation.mutate(o.id)}
                                                    disabled={payMutation.isPending}
                                                >
                                                    Mark Paid
                                                </Button>
                                            )}
                                        </div>
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

export default PaymentManagement;
