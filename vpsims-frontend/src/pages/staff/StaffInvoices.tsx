import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, FileText, Mail, Loader2, CheckCircle, Clock } from "lucide-react";
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

const StaffInvoices = () => {
    const queryClient = useQueryClient();
    const { data: orders = [], isLoading } = useQuery<Order[]>({
        queryKey: ['staff-orders'],
        queryFn: async () => {
          const { data } = await api.get('/order');
          return data;
        }
    });

    const emailMutation = useMutation({
        mutationFn: (id: number) => api.post(`/order/${id}/send-invoice`),
        onSuccess: () => {
          toast.success("Invoice Transmitted", { description: "The professional receipt was dispatched via secure relay." });
        },
        onError: () => {
          toast.error("Transmission Failure", { description: "Verify outbound SMTP configuration." });
        }
    });

    const handleDownloadPdf = async (id: number) => {
        try {
          const response = await api.get(`/order/${id}/pdf`, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Invoice_INV-${id.toString().padStart(6, '0')}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          toast.success("PDF Synchronized");
        } catch (e) {
          toast.error("PDF Generation Error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-heading font-black tracking-tight text-foreground">Financial Ledger</h1>
                <p className="text-muted-foreground font-medium">Verify transaction status and dispatch professional customer invoices.</p>
            </div>
            
            <Card className="glass-card shadow-xl border-border/40 overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="font-bold text-xs uppercase pl-6">Reference</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Account Holder</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Total (NPR)</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Ledger State</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Remaining</TableHead>
                                <TableHead className="font-bold text-xs uppercase text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto opacity-50" />
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                                        No financial entries found.
                                    </TableCell>
                                </TableRow>
                            ) : orders.map((inv) => (
                                <TableRow key={inv.id} className="hover:bg-muted/20 transition-colors">
                                    <TableCell className="pl-6 font-black font-mono text-primary text-xs">
                                        INV-{inv.id.toString().padStart(6, '0')}
                                    </TableCell>
                                    <TableCell className="font-bold text-foreground">{inv.customerName}</TableCell>
                                    <TableCell className="font-black tabular-nums">Rs. {inv.totalAmount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="outline" 
                                            className={`font-black text-[9px] uppercase px-2 py-0.5 flex items-center gap-1 w-fit ${
                                                inv.paymentStatus === "Paid" 
                                                    ? "bg-success/5 text-success border-success/30" 
                                                    : "bg-warning/5 text-warning border-warning/30"
                                            }`}
                                        >
                                            {inv.paymentStatus === "Paid" ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                            {inv.paymentStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={`font-bold tabular-nums ${inv.totalAmount - inv.amountPaid > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                        Rs. {(inv.totalAmount - (inv.amountPaid || 0)).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 px-3 text-[10px] font-black uppercase hover:bg-primary/10 hover:text-primary transition-colors"
                                                onClick={() => handleDownloadPdf(inv.id)}
                                            >
                                                <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 px-3 text-[10px] font-black uppercase text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:grayscale"
                                                onClick={() => emailMutation.mutate(inv.id)}
                                                disabled={emailMutation.isPending || inv.paymentStatus === "Paid"}
                                            >
                                                <Mail className="w-3.5 h-3.5 mr-1" /> {emailMutation.isPending && emailMutation.variables === inv.id ? "Syncing..." : "Dispatch Email"}
                                            </Button>
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

export default StaffInvoices;
