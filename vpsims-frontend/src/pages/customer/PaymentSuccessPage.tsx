import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight, Home, Receipt, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from 'sonner';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !orderId) {
        setError("Invalid session or order ID.");
        setLoading(false);
        return;
      }

      try {
        await api.post('/stripe/verify-payment', { 
          sessionId, 
          orderId: parseInt(orderId) 
        });
        toast.success("Payment verified successfully!");
      } catch (err: any) {
        console.error("Verification error:", err);
        setError(err.response?.data?.message || "Failed to verify payment status.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, orderId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full border-border rounded-2xl overflow-hidden text-center shadow-xl bg-card">
        <div className={`h-2 w-full ${error ? 'bg-red-500' : 'bg-emerald-500'}`} />
        <CardHeader className="pt-10 pb-4">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${error ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
            {loading ? (
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            ) : error ? (
              <XCircle className="w-10 h-10 text-red-600" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-foreground">
            {loading ? "Verifying Payment..." : error ? "Verification Failed" : "Payment Successful!"}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {loading ? "Please wait while we confirm your transaction." : error ? error : "Your transaction has been processed successfully."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-10">
          <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm">
            <p className="text-muted-foreground mb-1 font-black uppercase tracking-widest text-[10px]">Reference Number</p>
            <p className="font-mono text-xs break-all text-foreground opacity-80">{sessionId || 'N/A'}</p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full bg-primary text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20">
                <Link to="/customer/payments">
                  <Receipt className="w-4 h-4 mr-2" /> View My Payments <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-11 border-border rounded-xl">
                <Link to="/customer/dashboard">
                  <Home className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
