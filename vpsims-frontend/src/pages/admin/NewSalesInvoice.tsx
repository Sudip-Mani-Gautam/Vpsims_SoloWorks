import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { 
  ChevronRight, Plus, Trash2, Loader2, Calendar, 
  DollarSign, Percent, User, FileText, CheckCircle2, 
  AlertCircle, Sparkles, Package, Search, ChevronDown, Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface Part {
  id: number;
  name: string;
  sku: string;
  sellingPrice: number;
  stockQuantity: number;
  brand?: string;
}

const NewSalesInvoice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isStaff = user?.role?.toLowerCase() === 'staff';
  const basePath = isStaff ? '/staff' : '/admin';

  // Forms and details state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | { id: string; name: string } | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [manualDiscount, setManualDiscount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string>("Pending");

  // Line items state
  const [items, setItems] = useState<Array<{ partId: string; quantity: number; unitPrice: number; searchVal: string; dropdownOpen: boolean }>>([
    { partId: "", quantity: 0, unitPrice: 0, searchVal: "", dropdownOpen: false }
  ]);

  // Loading customers and parts
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const { data } = await api.get('/user');
      return data.filter((u: any) => u.role?.toLowerCase() === 'customer');
    }
  });

  const { data: parts = [], isLoading: isLoadingParts } = useQuery<Part[]>({
    queryKey: ['parts-list'],
    queryFn: async () => {
      const { data } = await api.get('/part');
      return data;
    }
  });

  // Filtered customer list based on search
  const filteredCustomers = useMemo(() => {
    const term = customerSearch.toLowerCase();
    const guestItem = { id: "guest", name: "Guest / Walk-in Customer", email: "No account required", phone: "" };
    const filtered = customers.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.email.toLowerCase().includes(term) || 
      (c.phone && c.phone.includes(term))
    );
    return [guestItem, ...filtered];
  }, [customers, customerSearch]);

  // Pricing calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  }, [items]);

  // Loyalty Program: Auto 10% discount if > 5000 NPR
  const isLoyaltyApplied = subtotal > 5000;
  const loyaltyDiscountAmount = isLoyaltyApplied ? subtotal * 0.1 : 0;

  // Manual Discount logic (percentage applied to the remaining subtotal)
  const manualDiscountAmount = useMemo(() => {
    const baseForManual = subtotal - loyaltyDiscountAmount;
    const pct = Math.min(100, Math.max(0, manualDiscount));
    return baseForManual * (pct / 100);
  }, [subtotal, loyaltyDiscountAmount, manualDiscount]);

  const grandTotal = useMemo(() => {
    const total = subtotal - loyaltyDiscountAmount - manualDiscountAmount;
    return Math.max(0, total);
  }, [subtotal, loyaltyDiscountAmount, manualDiscountAmount]);

  // Auto determine payment status or set manually if amountPaid matches grandTotal
  useEffect(() => {
    if (amountPaid > 0 && amountPaid >= grandTotal && grandTotal > 0) {
      setPaymentStatus("Paid");
    } else {
      setPaymentStatus("Pending");
    }
  }, [amountPaid, grandTotal]);

  // Handle invoice generation request
  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/order', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("Sales Invoice Generated successfully!");
      navigate(`${basePath}/sales-invoices`);
    },
    onError: (err: any) => {
      const backendMessage = err.response?.data?.message || err.response?.data || "Failed to generate sales invoice.";
      toast.error(typeof backendMessage === 'string' ? backendMessage : "Failed to generate sales invoice. Check stock limits.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error("Please select an Account Holder / Customer.");
      return;
    }

    if (selectedCustomer.id === "guest" && !guestName.trim()) {
      toast.error("Please specify the Guest Full Name.");
      return;
    }

    // Filter out invalid items
    const validItems = items.filter(item => item.partId !== "" && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one item with a quantity greater than zero.");
      return;
    }

    // Validation for quantities exceeding stock
    for (const item of validItems) {
      const part = parts.find(p => p.id === parseInt(item.partId));
      if (part && item.quantity > part.stockQuantity) {
        toast.error(`Quantity for "${part.name}" exceeds available stock (${part.stockQuantity} remaining).`);
        return;
      }
    }

    const payload = {
      UserId: selectedCustomer.id === "guest" ? null : selectedCustomer.id,
      GuestName: selectedCustomer.id === "guest" ? guestName : null,
      Items: validItems.map(item => ({
        PartId: parseInt(item.partId),
        Quantity: item.quantity
      })),
      AmountPaid: amountPaid,
      PaymentStatus: paymentStatus,
      Notes: notes,
      DueDate: dueDate ? new Date(dueDate).toISOString() : null
    };

    createInvoiceMutation.mutate(payload);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { partId: "", quantity: 0, unitPrice: 0, searchVal: "", dropdownOpen: false }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated.length === 0 ? [{ partId: "", quantity: 0, unitPrice: 0, searchVal: "", dropdownOpen: false }] : updated);
  };

  const handleUpdateItem = (index: number, key: string, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: val };
    setItems(updated);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto py-2">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="px-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={basePath}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`${basePath}/sales-invoices`}>Sales Invoices</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Invoice</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="page-title">New Sales Invoice</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black tracking-widest px-2 py-0.5">DRAFT</Badge>
          </div>
          <p className="page-subtitle">Draft a new professional invoice and deduct parts from stock inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Left Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Customer Details */}
          <Card className="card-standard overflow-visible">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-primary" /> Customer Selection
              </CardTitle>
              <CardDescription>Select the account holder or check-in a guest customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible">
                
                {/* Account Holder Dropdown search select */}
                <div className="relative flex flex-col gap-1.5 overflow-visible">
                  <Label htmlFor="account-holder" className="font-semibold text-xs text-foreground">Account Holder <span className="text-destructive">*</span></Label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg bg-card text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all border-border text-foreground"
                    >
                      <span className="truncate">
                        {selectedCustomer ? selectedCustomer.name : "Select account holder..."}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
                    </button>

                    {isCustomerDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 border rounded-lg bg-popover text-popover-foreground shadow-lg overflow-hidden animate-slide-up">
                        <div className="p-2 border-b border-border bg-muted/20 flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <input
                            type="text"
                            placeholder="Search customers..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-xs p-1 focus:ring-0 text-foreground"
                            autoFocus
                          />
                        </div>
                        <ul className="max-h-56 overflow-y-auto py-1 divide-y divide-border/20 custom-scrollbar">
                          {filteredCustomers.length === 0 ? (
                            <li className="px-4 py-2.5 text-xs text-muted-foreground text-center">No customers found</li>
                          ) : (
                            filteredCustomers.map(cust => (
                              <li
                                key={cust.id}
                                onClick={() => {
                                  setSelectedCustomer(cust);
                                  setIsCustomerDropdownOpen(false);
                                  setCustomerSearch("");
                                }}
                                className="px-3 py-2 text-xs hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between transition-colors"
                              >
                                <div>
                                  <p className="font-bold">{cust.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{cust.email} {cust.phone ? `• ${cust.phone}` : ""}</p>
                                </div>
                                {selectedCustomer?.id === cust.id && <Check className="w-3.5 h-3.5 text-primary" />}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Due Date Input */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="due-date" className="font-semibold text-xs text-foreground">Payment Due Date (Optional)</Label>
                  <div className="relative">
                    <input
                      type="date"
                      id="due-date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all border-border"
                    />
                  </div>
                </div>

              </div>

              {/* Slide-in Guest Customer Name input field */}
              {selectedCustomer?.id === "guest" && (
                <div className="p-4 border border-dashed border-primary/20 bg-primary/5 rounded-xl space-y-2 animate-slide-up">
                  <Label htmlFor="guest-name" className="font-bold text-xs text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Guest Customer Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="guest-name"
                    placeholder="Enter walk-in customer's name..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="h-9 border-primary/25 focus:ring-primary focus-visible:ring-primary"
                    required
                  />
                  <p className="text-[10px] text-primary/70">An invoice will be generated directly under this guest's name without requiring account registration.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Items Details List */}
          <Card className="card-standard overflow-visible">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Package className="w-4 h-4 text-primary" /> Invoice Line Items
              </CardTitle>
              <CardDescription>Select components from the active inventory catalog and set checkout quantities</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-visible">
              <div className="overflow-x-auto overflow-visible custom-scrollbar">
                <Table className="overflow-visible">
                  <TableHeader>
                    <TableRow className="bg-muted/50 border-b border-border">
                      <TableHead className="text-overline pl-5 w-[45%]">Part / Component</TableHead>
                      <TableHead className="text-overline text-center w-[15%]">Stock Status</TableHead>
                      <TableHead className="text-overline text-center w-[15%]">Quantity</TableHead>
                      <TableHead className="text-overline text-right w-[15%]">Unit Price</TableHead>
                      <TableHead className="text-overline text-right w-[15%]">Subtotal</TableHead>
                      <TableHead className="w-[5%] pr-5"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="overflow-visible">
                    {items.map((item, index) => {
                      const matchedPart = parts.find(p => p.id === parseInt(item.partId));
                      const stockVal = matchedPart ? matchedPart.stockQuantity : 0;
                      const hasExceeded = item.quantity > stockVal;

                      return (
                        <TableRow key={index} className="hover:bg-muted/20 border-b border-border/50 overflow-visible">
                          
                          {/* Part Selection Dropdown */}
                          <TableCell className="pl-5 py-3 overflow-visible">
                            <div className="relative overflow-visible">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...items];
                                  updated.forEach((it, idx) => {
                                    if (idx !== index) it.dropdownOpen = false;
                                  });
                                  updated[index].dropdownOpen = !updated[index].dropdownOpen;
                                  setItems(updated);
                                }}
                                className="w-full flex items-center justify-between px-3 py-1.5 text-xs border rounded-lg bg-card text-left focus:outline-none focus:ring-2 focus:ring-primary border-border text-foreground"
                              >
                                <span className="truncate">
                                  {matchedPart ? `${matchedPart.name} (${matchedPart.sku})` : "Choose part..."}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
                              </button>

                              {item.dropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 border rounded-lg bg-popover text-popover-foreground shadow-lg overflow-hidden animate-slide-up">
                                  <div className="p-2 border-b border-border bg-muted/20 flex items-center gap-2">
                                    <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                                    <input
                                      type="text"
                                      placeholder="Search inventory..."
                                      value={item.searchVal}
                                      onChange={(e) => handleUpdateItem(index, "searchVal", e.target.value)}
                                      className="w-full bg-transparent border-none outline-none text-xs p-1 focus:ring-0 text-foreground"
                                      autoFocus
                                    />
                                  </div>
                                  <ul className="max-h-48 overflow-y-auto py-1 divide-y divide-border/20 custom-scrollbar">
                                    {parts.filter(p => p.name.toLowerCase().includes(item.searchVal.toLowerCase()) || p.sku.toLowerCase().includes(item.searchVal.toLowerCase())).length === 0 ? (
                                      <li className="px-3 py-2 text-[11px] text-muted-foreground text-center">No parts matching</li>
                                    ) : (
                                      parts
                                        .filter(p => p.name.toLowerCase().includes(item.searchVal.toLowerCase()) || p.sku.toLowerCase().includes(item.searchVal.toLowerCase()))
                                        .map(p => (
                                          <li
                                            key={p.id}
                                            onClick={() => {
                                              const updated = [...items];
                                              updated[index] = {
                                                ...updated[index],
                                                partId: p.id.toString(),
                                                unitPrice: p.sellingPrice,
                                                searchVal: "",
                                                dropdownOpen: false
                                              };
                                              setItems(updated);
                                            }}
                                            className="px-3 py-1.5 text-[11px] hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between transition-colors"
                                          >
                                            <div>
                                              <p className="font-bold">{p.name}</p>
                                              <p className="text-[10px] text-muted-foreground">SKU: {p.sku} • Stock: {p.stockQuantity}</p>
                                            </div>
                                            <span className="font-bold text-primary">NPR {p.sellingPrice.toLocaleString()}</span>
                                          </li>
                                        ))
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Stock Status Badge */}
                          <TableCell className="text-center py-3">
                            {matchedPart ? (
                              stockVal > 0 ? (
                                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                                  {stockVal} units
                                </Badge>
                              ) : (
                                <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800 text-[10px] font-bold">
                                  OUT
                                </Badge>
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>

                          {/* Quantity Selector */}
                          <TableCell className="py-3">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                value={item.quantity === 0 ? "" : item.quantity}
                                onChange={(e) => {
                                  const v = parseInt(e.target.value) || 0;
                                  handleUpdateItem(index, "quantity", v);
                                }}
                                className={cn(
                                  "w-20 text-center h-8 text-xs font-bold focus:ring-primary focus-visible:ring-primary focus:border-transparent",
                                  hasExceeded && "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300"
                                )}
                                placeholder="0"
                                disabled={!item.partId}
                              />
                              {hasExceeded && (
                                <span className="text-[9px] text-red-500 font-semibold flex items-center gap-0.5 leading-none">
                                  <AlertCircle className="w-2.5 h-2.5" /> Over stock limit
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Unit Price */}
                          <TableCell className="text-right py-3 font-semibold text-xs tabular-nums text-foreground">
                            {item.unitPrice > 0 ? `NPR ${item.unitPrice.toLocaleString()}` : "—"}
                          </TableCell>

                          {/* Line Subtotal */}
                          <TableCell className="text-right py-3 font-bold text-xs tabular-nums text-foreground">
                            NPR {(item.quantity * item.unitPrice).toLocaleString()}
                          </TableCell>

                          {/* Delete Item Action */}
                          <TableCell className="pr-5 text-right py-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(index)}
                              className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              disabled={items.length === 1 && !item.partId}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>

                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Add Item Trigger row */}
              <div className="p-4 border-t border-border flex justify-between items-center bg-muted/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="border-dashed border-2 hover:border-solid hover:bg-background text-xs font-bold text-primary border-primary/30 h-8"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Line Item
                </Button>
                <span className="text-xs text-muted-foreground font-medium">
                  {items.filter(i => i.partId).length} unique part(s) selected
                </span>
              </div>

            </CardContent>
          </Card>

          {/* Section 3: Extra Invoice Notes */}
          <Card className="card-standard">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-overline text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Include payment notes, credit information, specific vehicle plate link, or reference details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs min-h-[70px] resize-none"
              />
            </CardContent>
          </Card>

        </div>

        {/* Right Sidebar pricing summary card */}
        <div className="space-y-6">
          <Card className="card-standard shadow-md sticky top-6">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                Checkout Details
              </CardTitle>
              <CardDescription>Live pricing summary & invoice dispatcher</CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              
              {/* Financial calculations lists */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold tabular-nums text-foreground">NPR {subtotal.toLocaleString()}</span>
                </div>

                {/* Loyalty discount indicator row */}
                {isLoyaltyApplied && (
                  <div className="flex flex-col gap-1 py-1 border-y border-dashed border-emerald-200/50 bg-emerald-50/20 dark:bg-emerald-950/10 p-2 rounded-lg">
                    <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" /> Auto Loyalty Reward
                      </span>
                      <span className="tabular-nums">-NPR {loyaltyDiscountAmount.toLocaleString()}</span>
                    </div>
                    <span className="text-[9px] text-emerald-500 dark:text-emerald-400 font-medium">Automatic 10% discount applied for orders exceeding NPR 5,000.</span>
                  </div>
                )}

                {/* Manual discount inputs */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="manual-discount" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" /> Manual Discount (%)
                    </Label>
                    <input
                      id="manual-discount"
                      type="number"
                      min="0"
                      max="100"
                      value={manualDiscount === 0 ? "" : manualDiscount}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                        setManualDiscount(val);
                      }}
                      placeholder="0"
                      className="w-16 h-7 text-xs text-right font-bold border rounded bg-card px-2 text-foreground border-border focus:ring-primary focus:outline-none"
                    />
                  </div>
                  {manualDiscount > 0 && (
                    <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold">
                      <span>Manual Discount Amount</span>
                      <span className="tabular-nums text-foreground">-NPR {manualDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border/80 pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-foreground">Grand Total</span>
                  <span className="text-lg font-black text-primary tabular-nums">
                    NPR {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment inputs */}
              <div className="space-y-4 pt-3 border-t border-border/60">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="amount-paid" className="font-semibold text-xs text-foreground">Amount Paid (NPR)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      id="amount-paid"
                      type="number"
                      min="0"
                      max={grandTotal}
                      value={amountPaid === 0 ? "" : amountPaid}
                      onChange={(e) => {
                        const val = Math.min(grandTotal, Math.max(0, parseFloat(e.target.value) || 0));
                        setAmountPaid(val);
                      }}
                      placeholder="0.00"
                      className="pl-8 text-xs font-bold text-foreground"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">Payment Status</span>
                  <Badge className={cn("text-[10px] font-black tracking-widest px-2 py-0.5", 
                    paymentStatus === "Paid" 
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" 
                      : "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                  )}>
                    {paymentStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Accordion Component */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b border-border/40">
                  <AccordionTrigger className="text-xs font-semibold hover:no-underline py-2 text-muted-foreground">Invoice Terms & Policy</AccordionTrigger>
                  <AccordionContent className="text-[10px] text-muted-foreground/80 leading-relaxed pt-1 space-y-1">
                    <p>• Loyalty Points are automatically credited to registered customer profiles upon payment verification (1 point per 100 NPR).</p>
                    <p>• Credit invoice terms require payment on or before the specified Payment Due Date.</p>
                    <p>• Returned parts are subject to a 10% restocking fee. Electronic parts cannot be returned once installed.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-xs h-10 shadow-sm flex items-center justify-center gap-1.5"
                  disabled={createInvoiceMutation.isPending}
                >
                  {createInvoiceMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating Invoice...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Generate Sales Invoice
                    </>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`${basePath}/sales-invoices`)}
                  className="w-full text-xs h-10 font-bold border-border/80 hover:bg-muted text-foreground"
                >
                  Cancel
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default NewSalesInvoice;
