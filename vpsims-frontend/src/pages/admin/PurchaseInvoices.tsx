import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Search, Download, FileText, Calendar, Filter, Plus } from "lucide-react";
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

const statusStyle = (s: string) =>
  s === "Completed"
    ? "bg-green-100 text-green-700 border border-green-200"
    : s === "Pending"
    ? "bg-amber-100 text-amber-700 border border-amber-200"
    : "bg-gray-100 text-gray-600 border border-gray-200";

const PurchaseInvoices = () => {
  const [search, setSearch] = useState("");

  const mockPurchases: PurchaseInvoice[] = [
    { id: 101, vendorName: "Bosch Automotive", totalAmount: 45000, status: "Completed", purchaseDate: "2024-05-01", itemsCount: 12 },
    { id: 102, vendorName: "Castrol Oil Co.", totalAmount: 12500, status: "Pending", purchaseDate: "2024-05-04", itemsCount: 5 },
    { id: 103, vendorName: "Michelin Tires", totalAmount: 89000, status: "Completed", purchaseDate: "2024-04-28", itemsCount: 20 },
  ];

  const filtered = mockPurchases.filter(p =>
    p.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toString().includes(search)
  );

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
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Filter className="w-3.5 h-3.5" /> Filter
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                      <FileText className="w-4 h-4" />
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

export default PurchaseInvoices;
