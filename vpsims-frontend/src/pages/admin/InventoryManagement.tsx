import { useEffect, useState } from 'react';
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
      toast.error("Failed to synchronize distributed warehouse data.");
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
        toast.success("Inventory component updated.");
      } else {
        await api.post('/part', formData, config);
        toast.success("New component registered in the ledger.");
      }
      setIsModalOpen(false);
      load();
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Technical registration error.';
      if (data?.message) msg = data.message;
      else if (data?.errors) msg = Object.values(data.errors).flat()[0] as string;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Decommission this inventory item?')) return;
    try {
      await api.delete(`/part/${id}`);
      toast.success("Component removed from system.");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Decommission failed.');
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-black tracking-tight text-foreground">Parts Inventory</h1>
          <p className="text-muted-foreground font-medium">Manage and monitor your distributed spare parts ledger.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex hover-lift shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          {canEdit && (
            <Button onClick={handleOpenAdd} className="bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 hover-lift">
              <Plus className="w-4 h-4 mr-2" /> Add Component
            </Button>
          )}
        </div>
      </div>

      <div className="relative max-w-md shadow-sm rounded-xl overflow-hidden group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          className="pl-11 h-11 bg-card border-border/50 focus:border-primary transition-all duration-300" 
          placeholder="Search by SKU, Name or Description..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <Card className="glass-card shadow-xl overflow-hidden border-border/40">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase tracking-wider pl-6">SKU</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Component Identity</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Classification</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Distributor</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Visual Asset</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-center">In-Stock</TableHead>
                {isAdmin && <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Cost Price (NPR)</TableHead>}
                <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Selling Price (NPR)</TableHead>
                {isAdmin && <TableHead className="font-bold text-xs uppercase tracking-wider text-right text-success">Profit (NPR)</TableHead>}
                {canEdit && <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-6">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 9 : 8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
                        <p className="text-muted-foreground font-medium animate-pulse">Synchronizing ledger...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={canEdit ? 9 : 8} className="h-64 text-center">
                        <p className="text-muted-foreground font-medium">No components found matching your search criteria.</p>
                    </TableCell>
                </TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="pl-6"><code className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-md">{p.sku}</code></TableCell>
                  <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                  <TableCell><Badge variant="outline" className="bg-background font-bold text-[10px] uppercase">{p.categoryName}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Truck className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{p.supplierName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                        <div className="w-10 h-10 rounded-lg border border-border/50 overflow-hidden shadow-sm bg-muted/30 flex items-center justify-center">
                            {p.imageUrl ? (
                                <img src={getFullImageUrl(p.imageUrl)!} alt="" className="w-full h-full object-cover transition-transform hover:scale-125 cursor-zoom-in" />
                            ) : (
                                <Package className="w-4 h-4 text-muted-foreground opacity-50" />
                            )}
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${(p.stockQuantity ?? 0) < (p.minimumStockAlertLevel ?? 5) ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"}`} />
                        <span className="font-black text-foreground tabular-nums">{p.stockQuantity ?? 0}</span>
                        {(p.stockQuantity ?? 0) < (p.minimumStockAlertLevel ?? 5) && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                    </div>
                  </TableCell>
                  {isAdmin && <TableCell className="text-right font-black tabular-nums text-muted-foreground">NPR {(p.costPrice ?? 0).toLocaleString()}</TableCell>}
                  <TableCell className="text-right font-black tabular-nums text-primary">NPR {(p.sellingPrice ?? 0).toLocaleString()}</TableCell>
                  {isAdmin && <TableCell className="text-right font-black tabular-nums text-success">NPR {((p.sellingPrice ?? 0) - (p.costPrice ?? 0)).toLocaleString()}</TableCell>}
                  {canEdit && (
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleOpenEdit(p)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors text-destructive/70" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
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
        <DialogContent className="max-w-2xl border-white/10 shadow-2xl rounded-2xl overflow-hidden glass-card p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/10">
            <DialogTitle className="text-2xl font-heading font-bold">{editingPart ? 'Update Inventory Item' : 'New Component Registration'}</DialogTitle>
            <DialogDescription>Provide technical specifications and visual mapping for the warehouse ledger.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 md:col-span-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Official Component Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g., Performance Brake Pad Set" className="bg-background/50" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reference SKU</Label>
                        <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required placeholder="REF-XXXX" className="bg-background/50" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Brand</Label>
                            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Bosch" className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Compatible Vehicle Model</Label>
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
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rack / Shelf Location</Label>
                        <Input value={form.rackLocation} onChange={(e) => setForm({ ...form, rackLocation: e.target.value })} placeholder="e.g. A-12" className="bg-background/50" />
                    </div>

                    {isAdmin ? (
                        <div className="space-y-4 md:col-span-2 p-4 border border-border/50 rounded-xl bg-muted/10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Vendor Pricing Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cost Price (CP)</Label>
                                    <Input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} required placeholder="0.00" className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Margin Type</Label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.marginType} onChange={(e) => setForm({ ...form, marginType: e.target.value })}>
                                        <option value="Percentage">Percentage (%)</option>
                                        <option value="Fixed Amount">Fixed Amount</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {form.marginType === 'Percentage' ? (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Margin Percentage (%)</Label>
                                        <Input type="number" step="0.01" value={form.marginPercentage} onChange={(e) => setForm({ ...form, marginPercentage: e.target.value })} placeholder="0" className="bg-background/50" />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Margin Amount</Label>
                                        <Input type="number" step="0.01" value={form.marginAmount} onChange={(e) => setForm({ ...form, marginAmount: e.target.value })} placeholder="0.00" className="bg-background/50" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Selling Price (SP)</Label>
                                    <Input type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="Override calculated SP" className="bg-background/50" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Min Order Qty</Label>
                                    <Input type="number" value={form.minimumOrderQuantity} onChange={(e) => setForm({ ...form, minimumOrderQuantity: e.target.value })} placeholder="1" className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Delivery Time</Label>
                                    <Input value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} placeholder="e.g. 2-3 Days" className="bg-background/50" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Selling Price (NPR)</Label>
                            <Input type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required placeholder="0.00" className="bg-background/50" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Product Category</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                            <option value="">Select Category...</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary source supplier</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required>
                            <option value="">Select Company...</option>
                            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-4 md:col-span-2">
                         <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Visual Asset Mapping</Label>
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
                                    <Label className="text-[10px] text-muted-foreground uppercase">...or Cloud Image Asset URL</Label>
                                    <Input value={form.imageUrl} onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); setImageFile(null); setPreviewUrl(e.target.value); }} placeholder="https://..." className="h-8 text-xs bg-background/30" />
                                </div>
                             </div>
                         </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Technical Specification Summary</Label>
                        <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Detail performance metrics and specifications..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                </div>
            </div>
            <DialogFooter className="p-6 bg-muted/5 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel Sector Action</Button>
              <Button type="submit" className="bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : editingPart ? 'Update Component' : 'Finalize Registration'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
