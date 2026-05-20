import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Search, Download, FileText, Calendar, Filter, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PurchaseInvoice {
  id: number;
  vendorName: string;
  totalAmount: number;
  status: string;
  purchaseDate: string;
  itemsCount: number;
}

interface FilterOptions {
  status: string;
  minAmount: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
}

const statusStyle = (s: string) =>
  s === "Completed"
    ? "bg-green-100 text-green-700 border border-green-200"
    : s === "Pending"
    ? "bg-amber-100 text-amber-700 border border-amber-200"
    : "bg-gray-100 text-gray-600 border border-gray-200";

const PurchaseInvoices = () => {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["purchase-invoices"],
    queryFn: async () => {
      const res = await api.get("/purchase-invoices");
      return res.data as PurchaseInvoice[];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const items = data ?? [];

  const filtered = items.filter(p => {
    // Search filter
    const matchSearch = p.vendorName.toLowerCase().includes(search.toLowerCase()) || p.id.toString().includes(search);
    
    // Status filter
    const matchStatus = !filters.status || p.status === filters.status;
    
    // Amount filter
    const minAmount = filters.minAmount ? parseFloat(filters.minAmount) : 0;
    const maxAmount = filters.maxAmount ? parseFloat(filters.maxAmount) : Infinity;
    const matchAmount = p.totalAmount >= minAmount && p.totalAmount <= maxAmount;
    
    // Date filter
    const pDate = new Date(p.purchaseDate);
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;
    const matchDate =
      (!startDate || pDate >= startDate) &&
      (!endDate || pDate <= endDate);
    
    return matchSearch && matchStatus && matchAmount && matchDate;
  });

  const exportCSV = () => {
    if (filtered.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Invoice ID", "Vendor", "Date", "Items", "Amount (NPR)", "Status"];
    const rows = filtered.map(p => [
      `#PUR-${p.id}`,
      p.vendorName,
      format(new Date(p.purchaseDate), "MMM d, yyyy"),
      p.itemsCount,
      p.totalAmount.toLocaleString(),
      p.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase-invoices-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleDownloadPdf = async (id: number) => {
    try {
      const response = await api.get(`/purchase-invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Purchase_PUR-${id.toString().padStart(6, '0')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF Downloaded");
    } catch (e) {
      toast.error("PDF Generation Error");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Purchase Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Vendor acquisition records and procurement history</p>
        </div>
        <Button size="sm" className="gap-2 h-9">
          <Plus className="w-4 h-4" /> New Purchase
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 h-9"
            placeholder="Search vendor or invoice ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => setShowFilter(!showFilter)}>
          <Filter className="w-3.5 h-3.5" /> Filter
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-2" onClick={exportCSV}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">Advanced Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilter(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
              {/* Status Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full h-9 mt-1 px-3 text-sm border border-input rounded-md bg-background"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Min Amount */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Min Amount</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  className="h-9 mt-1 text-sm"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Max Amount</label>
                <Input
                  type="number"
                  placeholder="999999"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  className="h-9 mt-1 text-sm"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">From Date</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="h-9 mt-1 text-sm"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">To Date</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="h-9 mt-1 text-sm"
                />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs">
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Failed to load purchase invoices from the database.
            </div>
          ) : isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Loading purchase invoices...
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="pl-5 text-xs font-medium text-muted-foreground w-[110px]">Invoice ID</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Vendor</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Items</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Amount</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="text-right pr-5 text-xs font-medium text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    No purchase invoices found.
                  </td>
                </tr>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <TableCell className="pl-5 font-mono text-xs text-primary font-medium">#PUR-{p.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground">{p.vendorName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {format(new Date(p.purchaseDate), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{p.itemsCount} items</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    NPR {p.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded", statusStyle(p.status))}>
                      {p.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-5">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleDownloadPdf(p.id)}
                      title="Download PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseInvoices;
