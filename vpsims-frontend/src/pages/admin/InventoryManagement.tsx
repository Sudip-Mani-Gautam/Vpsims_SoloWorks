import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus, Edit2, Trash2, Package, Search, Truck,
  Download, Settings as SettingsIcon, AlertTriangle,
  MapPin, Loader2, Image as ImageIcon, Upload, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Part {
  id: number;
  name: string;
  sku: string;
  markedPrice: number;
  sellingPrice: number;
  costPrice: number;
  stockQuantity: number;
  imageUrl: string;
  categoryName: string;
  categoryId: number;
  supplierId: number;
  supplierName: string;
  description: string;
  brand?: string;
  compatibleVehicleModel?: string;
  minimumStockAlertLevel?: number;
  rackLocation?: string;
  marginType?: string;
  marginPercentage?: number;
  marginAmount?: number;
  minimumOrderQuantity?: number;
  warrantyPeriod?: string;
  deliveryTime?: string;
  notes?: string;
}

interface Category { id: number; name: string; }
interface Supplier { id: number; name: string; }

const emptyForm = { 
  name: '', 
  description: '', 
  sku: '', 
  sellingPrice: '', 
  costPrice: '',
  stockQuantity: '', 
  imageUrl: '', 
  categoryId: '', 
  supplierId: '',
  brand: '',
  compatibleVehicleModel: '',
  minimumStockAlertLevel: '5',
  rackLocation: '',
  marginType: 'Percentage',
  marginPercentage: '0',
  marginAmount: '0',
  minimumOrderQuantity: '1',
  warrantyPeriod: '',
  deliveryTime: '',
  notes: ''
};

const InventoryManagement = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'Staff';
  const isAdmin = user?.role === 'Admin';
  
  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importForm, setImportForm] = useState({
    supplierId: '',
    partId: '',
    quantity: '1',
    urgency: 'Medium'
  });
  const [importing, setImporting] = useState(false);
  const queryClient = useQueryClient();

  const load = async () => {
    try {
      const [partsRes, catsRes, suppRes] = await Promise.all([
        api.get('/part'), api.get('/category'), api.get('/supplier'),
      ]);
      setParts(partsRes.data);
      setCategories(catsRes.data);
      setSuppliers(suppRes.data);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = parts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setForm({ ...form, imageUrl: '' });
    }
  };

  const handleOpenAdd = () => {
    setEditingPart(null);
    setForm(emptyForm);
    setImageFile(null);
    setPreviewUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Part) => {
    setEditingPart(p);
    setForm({ 
        name: p.name, 
        description: p.description || '', 
        sku: p.sku, 
        sellingPrice: (p.sellingPrice ?? 0).toString(), 
        costPrice: (p.costPrice ?? 0).toString(),
        stockQuantity: (p.stockQuantity ?? 0).toString(), 
        imageUrl: p.imageUrl || '', 
        categoryId: p.categoryId?.toString() || '', 
        supplierId: p.supplierId?.toString() || '',
        brand: p.brand || '',
        compatibleVehicleModel: p.compatibleVehicleModel || '',
        minimumStockAlertLevel: (p.minimumStockAlertLevel ?? 5).toString(),
        rackLocation: p.rackLocation || '',
        marginType: p.marginType || 'Percentage',
        marginPercentage: (p.marginPercentage ?? 0).toString(),
        marginAmount: (p.marginAmount ?? 0).toString(),
        minimumOrderQuantity: (p.minimumOrderQuantity ?? 1).toString(),
        warrantyPeriod: p.warrantyPeriod || '',
        deliveryTime: p.deliveryTime || '',
        notes: p.notes || ''
    });
    setImageFile(null);
    setPreviewUrl(getFullImageUrl(p.imageUrl) || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('markedPrice', '0'); // MP removed from UI, default to 0
    Object.keys(form).forEach(key => {
      let value = (form as any)[key];
      if (['sellingPrice', 'costPrice', 'stockQuantity', 'categoryId', 'supplierId', 'minimumStockAlertLevel', 'marginPercentage', 'marginAmount', 'minimumOrderQuantity'].includes(key)) {
        if (value === '' || value === null || value === undefined) return;
        value = (key === 'sellingPrice' || key === 'costPrice' || key === 'marginPercentage' || key === 'marginAmount') ? parseFloat(value) : parseInt(value);
      }
      formData.append(key, value);
    });

    if (imageFile) {
        formData.append('ImageFile', imageFile);
    }

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingPart) {
        await api.put(`/part/${editingPart.id}`, formData, config);
        toast.success("Part updated successfully.");
      } else {
        await api.post('/part', formData, config);
        toast.success("Part added to inventory.");
      }
      setIsModalOpen(false);
      load();
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Failed to save part.';
      if (data?.message) msg = data.message;
      else if (data?.errors) msg = Object.values(data.errors).flat()[0] as string;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importForm.partId || !importForm.quantity) {
      toast.error("Please select a part and specify quantity.");
      return;
    }

    setImporting(true);
    try {
      await api.post(`/part/${importForm.partId}/import`, {
        quantity: parseInt(importForm.quantity),
        urgency: importForm.urgency
      });
      toast.success("Inventory stock successfully imported from vendor.");
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      setIsImportModalOpen(false);
      setImportForm({ supplierId: '', partId: '', quantity: '1', urgency: 'Medium' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to import stock from vendor.");
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this part from inventory?')) return;
    try {
      await api.delete(`/part/${id}`);
      toast.success("Part deleted.");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete part.');
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:5164';
    return `${base}${url}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Parts Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track your spare parts stock.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          {canEdit && (
            <>
              <Button onClick={() => setIsImportModalOpen(true)} size="sm" variant="outline" className="gap-2">
                <Truck className="w-4 h-4" /> Import from Vendor
              </Button>
              <Button onClick={handleOpenAdd} size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Part
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9 h-9"
          placeholder="Search by SKU or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="text-xs font-medium text-muted-foreground pl-5 w-[110px]">SKU</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Name</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Category</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Supplier</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground text-center">Image</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground text-center">Stock</TableHead>
                {isAdmin && <TableHead className="text-xs font-medium text-muted-foreground text-right">Cost (NPR)</TableHead>}
                <TableHead className="text-xs font-medium text-muted-foreground text-right">Price (NPR)</TableHead>
                {isAdmin && <TableHead className="text-xs font-medium text-muted-foreground text-right">Profit (NPR)</TableHead>}
                {canEdit && <TableHead className="text-xs font-medium text-muted-foreground text-right pr-5">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 9 : 8} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading parts...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 9 : 8} className="h-32 text-center text-sm text-muted-foreground">
                    No parts found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <TableCell className="pl-5 font-mono text-xs text-primary font-medium">{p.sku}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">{p.name}</TableCell>
                  <TableCell><span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">{p.categoryName}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">{p.supplierName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <div className="w-9 h-9 rounded-md border border-border overflow-hidden bg-muted/30 flex items-center justify-center">
                        {p.imageUrl ? (
                          <img src={getFullImageUrl(p.imageUrl)!} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-muted-foreground/40" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${(p.stockQuantity ?? 0) < (p.minimumStockAlertLevel ?? 5) ? "bg-red-500" : "bg-green-500"}`} />
                      <span className="text-sm font-medium tabular-nums">{p.stockQuantity ?? 0}</span>
                      {(p.stockQuantity ?? 0) < (p.minimumStockAlertLevel ?? 5) && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                  </TableCell>
                  {isAdmin && <TableCell className="text-right text-sm tabular-nums text-muted-foreground">NPR {(p.costPrice ?? 0).toLocaleString()}</TableCell>}
                  <TableCell className="text-right text-sm font-medium tabular-nums text-foreground">NPR {(p.sellingPrice ?? 0).toLocaleString()}</TableCell>
                  {isAdmin && <TableCell className="text-right text-sm font-medium tabular-nums text-green-600">NPR {((p.sellingPrice ?? 0) - (p.costPrice ?? 0)).toLocaleString()}</TableCell>}
                  {canEdit && (
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleOpenEdit(p)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPart ? 'Edit Part' : 'Add New Part'}</DialogTitle>
            <DialogDescription>{editingPart ? 'Update the details for this part.' : 'Fill in the details to add a new part to inventory.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 md:col-span-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Part Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g., Performance Brake Pad Set" className="bg-background/50" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">SKU</Label>
                        <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required placeholder="REF-XXXX" className="bg-background/50" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Brand</Label>
                            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Bosch" className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Compatible Vehicle</Label>
                            <Input value={form.compatibleVehicleModel} onChange={(e) => setForm({ ...form, compatibleVehicleModel: e.target.value })} placeholder="e.g. Toyota Corolla 2020" className="bg-background/50" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Initial Stock Capacity</Label>
                            <Input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required placeholder="0" className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Min Stock Alert Level</Label>
                            <Input type="number" value={form.minimumStockAlertLevel} onChange={(e) => setForm({ ...form, minimumStockAlertLevel: e.target.value })} placeholder="5" className="bg-background/50" />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-medium">Rack / Shelf Location</Label>
                        <Input value={form.rackLocation} onChange={(e) => setForm({ ...form, rackLocation: e.target.value })} placeholder="e.g. A-12" className="bg-background/50" />
                    </div>

                    {isAdmin ? (
                        <div className="space-y-4 md:col-span-2 p-4 border border-border/50 rounded-xl bg-muted/10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Vendor Pricing Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Cost Price (NPR)</Label>
                                    <Input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} required placeholder="0.00" className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Margin Type</Label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.marginType} onChange={(e) => setForm({ ...form, marginType: e.target.value })}>
                                        <option value="Percentage">Percentage (%)</option>
                                        <option value="Fixed Amount">Fixed Amount</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {form.marginType === 'Percentage' ? (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Margin (%)</Label>
                                        <Input type="number" step="0.01" value={form.marginPercentage} onChange={(e) => setForm({ ...form, marginPercentage: e.target.value })} placeholder="0" className="bg-background/50" />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Margin Amount (NPR)</Label>
                                        <Input type="number" step="0.01" value={form.marginAmount} onChange={(e) => setForm({ ...form, marginAmount: e.target.value })} placeholder="0.00" className="bg-background/50" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Selling Price (NPR)</Label>
                                    <Input type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="Override calculated SP" className="bg-background/50" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Min Order Qty</Label>
                                    <Input type="number" value={form.minimumOrderQuantity} onChange={(e) => setForm({ ...form, minimumOrderQuantity: e.target.value })} placeholder="1" className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Delivery Time</Label>
                                    <Input value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} placeholder="e.g. 2-3 Days" className="bg-background/50" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-sm font-medium">Selling Price (NPR)</Label>
                            <Input type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required placeholder="0.00" className="bg-background/50" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Category</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                            <option value="">Select Category...</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Supplier</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required>
                            <option value="">Select Company...</option>
                            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-4 md:col-span-2">
                         <Label className="text-sm font-medium">Product Image</Label>
                         <div className="p-4 rounded-xl border border-dashed border-border flex items-center gap-6 bg-muted/10">
                             <div className="w-24 h-24 rounded-lg bg-card border border-border shadow-inner flex items-center justify-center overflow-hidden">
                                {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 opacity-10" />}
                             </div>
                             <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Label className="cursor-pointer">
                                        <div className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:opacity-80 transition-opacity">
                                            <Upload className="w-4 h-4" /> Local File Upload
                                        </div>
                                        <Input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </Label>
                                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{imageFile ? imageFile.name : 'No file selected'}</span>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Or paste an image URL</Label>
                                    <Input value={form.imageUrl} onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); setImageFile(null); setPreviewUrl(e.target.value); }} placeholder="https://..." className="h-8 text-xs bg-background/30" />
                                </div>
                             </div>
                         </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-medium">Description / Notes</Label>
                        <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" placeholder="Optional notes or description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : editingPart ? 'Save Changes' : 'Add Part'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import from Vendor</DialogTitle>
            <DialogDescription>
              Order and import parts directly into the inventory stock from active vendors.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImportSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Vendor</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={importForm.supplierId}
                onChange={(e) => setImportForm({ ...importForm, supplierId: e.target.value, partId: '' })}
                required
              >
                <option value="">-- Select Vendor --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Part</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={importForm.partId}
                onChange={(e) => setImportForm({ ...importForm, partId: e.target.value })}
                required
                disabled={!importForm.supplierId}
              >
                <option value="">
                  {importForm.supplierId ? "-- Select Part --" : "-- Select a vendor first --"}
                </option>
                {parts
                  .filter((p) => p.supplierId === parseInt(importForm.supplierId))
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={importForm.quantity}
                  onChange={(e) => setImportForm({ ...importForm, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Urgency</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={importForm.urgency}
                  onChange={(e) => setImportForm({ ...importForm, urgency: e.target.value })}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={importing || !importForm.partId}>
                {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Import Stock'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
