import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, Edit2, Trash2, Truck, X, Phone, Mail, MapPin, User, 
  Search, Loader2, Building2, ExternalLink, Package, AlertTriangle, 
  Image as ImageIcon, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Supplier {
  id: number;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  taxId?: string;
  category?: string;
  partCount?: number;
  isActive?: boolean;
}

interface Category {
  id: number;
  name: string;
}

const emptySupplierForm = { name: '', contactName: '', phone: '', email: '', address: '', website: '', taxId: '', category: '', isActive: true };

const PRESET_CATEGORIES = [
  "Engine Parts",
  "Suspension",
  "Electronics",
  "Interior",
  "Exterior",
  "Lighting",
  "Safety",
  "Logistics",
  "General"
];

const emptyPartForm = {
  name: '',
  description: '',
  sku: '',
  sellingPrice: '0.00',
  costPrice: '',
  stockQuantity: '10',
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

const VendorManagement = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'Staff';
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Vendor modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptySupplierForm);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  
  // Catalog modals
  const [selectedVendorParts, setSelectedVendorParts] = useState<any[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [currentVendorName, setCurrentVendorName] = useState('');

  // Add Part modals
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [selectedVendorForPart, setSelectedVendorForPart] = useState<Supplier | null>(null);
  const [partForm, setPartForm] = useState(emptyPartForm);
  const [partImageFile, setPartImageFile] = useState<File | null>(null);
  const [partPreviewUrl, setPartPreviewUrl] = useState('');
  const [partSubmitting, setPartSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [suppRes, catRes] = await Promise.all([
        api.get('/supplier'),
        api.get('/category')
      ]);
      setSuppliers(suppRes.data || []);
      setCategories(catRes.data || []);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load vendor metadata.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleCategory = (catName: string) => {
    const currentCats = form.category ? form.category.split(',').map(c => c.trim()).filter(Boolean) : [];
    let newCats: string[];
    if (currentCats.includes(catName)) {
      newCats = currentCats.filter(c => c !== catName);
    } else {
      newCats = [...currentCats, catName];
    }
    setForm(prev => ({ ...prev, category: newCats.join(', ') }));
  };

  // Auto calculate Selling Price in Add Part form
  useEffect(() => {
    const cp = parseFloat(partForm.costPrice) || 0;
    let sp = cp;
    if (partForm.marginType === 'Percentage') {
      const pct = parseFloat(partForm.marginPercentage) || 0;
      sp = cp + (cp * pct / 100);
    } else {
      const amt = parseFloat(partForm.marginAmount) || 0;
      sp = cp + amt;
    }
    setPartForm(prev => ({ ...prev, sellingPrice: sp.toFixed(2) }));
  }, [partForm.costPrice, partForm.marginType, partForm.marginPercentage, partForm.marginAmount]);

  const generateSkuPlaceholder = (vendorName: string) => {
    const name = vendorName.toLowerCase();
    let prefix = 'PT';
    if (name.includes('toyota')) prefix = 'TY';
    else if (name.includes('honda')) prefix = 'HN';
    else if (name.includes('hyundai') || name.includes('hyndye')) prefix = 'HY';
    else if (name.includes('ford')) prefix = 'FD';
    else if (name.includes('bmw')) prefix = 'BM';
    
    const num = Math.floor(100 + Math.random() * 900);
    return `${prefix}${num}`;
  };

  const handleOpenAddPart = (vendor: Supplier) => {
    setSelectedVendorForPart(vendor);
    const generatedSku = generateSkuPlaceholder(vendor.name);
    
    // Prefill Brand based on Vendor name
    let prefilledBrand = '';
    if (vendor.name.toLowerCase().includes('toyota')) prefilledBrand = 'Toyota';
    else if (vendor.name.toLowerCase().includes('honda')) prefilledBrand = 'Honda';
    else if (vendor.name.toLowerCase().includes('hyundai')) prefilledBrand = 'Hyundai';
    else if (vendor.name.toLowerCase().includes('ford')) prefilledBrand = 'Ford';
    else if (vendor.name.toLowerCase().includes('bmw')) prefilledBrand = 'BMW';

    setPartForm({
      ...emptyPartForm,
      supplierId: vendor.id.toString(),
      sku: generatedSku,
      brand: prefilledBrand
    });
    setPartImageFile(null);
    setPartPreviewUrl('');
    setIsAddPartOpen(true);
  };

  const handlePartFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPartImageFile(file);
      setPartPreviewUrl(URL.createObjectURL(file));
      setPartForm(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const handlePartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartSubmitting(true);

    const formData = new FormData();
    formData.append('markedPrice', '0'); // MP removed from UI, default to 0
    Object.keys(partForm).forEach(key => {
      let value = (partForm as any)[key];
      if (['sellingPrice', 'costPrice', 'stockQuantity', 'categoryId', 'supplierId', 'minimumStockAlertLevel', 'marginPercentage', 'marginAmount', 'minimumOrderQuantity'].includes(key)) {
        if (value === '' || value === null || value === undefined) return;
        value = (key === 'sellingPrice' || key === 'costPrice' || key === 'marginPercentage' || key === 'marginAmount') ? parseFloat(value) : parseInt(value);
      }
      formData.append(key, value);
    });

    if (partImageFile) {
      formData.append('ImageFile', partImageFile);
    }

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      await api.post('/part', formData, config);
      toast.success("New product registered and added to vendor catalog.");
      setIsAddPartOpen(false);
      load();
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Failed to register product.';
      if (data?.message) msg = data.message;
      else if (data?.errors) msg = Object.values(data.errors).flat()[0] as string;
      toast.error(msg);
    } finally {
      setPartSubmitting(false);
    }
  };

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setForm(emptySupplierForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setForm({ 
        name: s.name, 
        contactName: s.contactName, 
        phone: s.phone, 
        email: s.email, 
        address: s.address,
        website: s.website || '',
        taxId: s.taxId || '',
        category: s.category || '',
        isActive: s.isActive ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSupplier) {
        await api.put(`/supplier/${editingSupplier.id}`, form);
        toast.success("Vendor profile updated successfully.");
      } else {
        await api.post('/supplier', form);
        toast.success("New distribution partner registered.");
      }
      setIsModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Vendor operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await api.delete(`/supplier/${supplierToDelete.id}`);
      toast.success("Vendor deleted.");
      load();
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete vendor.');
    }
  };

  const handleViewCatalog = async (vendorId: number, vendorName: string) => {
    try {
      setCurrentVendorName(vendorName);
      const { data } = await api.get(`/part/supplier/${vendorId}`);
      setSelectedVendorParts(data || []);
      setIsCatalogOpen(true);
    } catch (e) {
      toast.error("Failed to load vendor catalog.");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Vendors</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your suppliers and procurement partners.</p>
        </div>
        {canEdit && (
          <Button onClick={handleOpenAdd} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Vendor
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9 h-9"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="text-xs font-medium text-muted-foreground pl-5">Vendor</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Contact</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Phone / Email</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Category</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground text-center">Parts</TableHead>
                {canEdit && <TableHead className="text-xs font-medium text-muted-foreground text-right pr-5">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 6 : 5} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading vendors...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 6 : 5} className="h-32 text-center text-sm text-muted-foreground">
                    No vendors found.
                  </TableCell>
                </TableRow>
              ) : filtered.map((s) => (
                <TableRow key={s.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        {s.address && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5" />{s.address}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border border-border shrink-0">
                        {s.contactName[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm text-foreground">{s.contactName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Phone className="w-3 h-3 text-muted-foreground shrink-0" /> {s.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3 shrink-0" /> {s.email}
                      </div>
                      {s.website && (
                        <a href={s.website.startsWith('http') ? s.website : `https://${s.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <ExternalLink className="w-2.5 h-2.5" /> Website
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">{s.category || 'General'}</span>
                      <div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${ s.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200' }`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {s.taxId && <p className="text-xs text-muted-foreground">PAN: {s.taxId}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      className="text-xs text-primary hover:underline font-semibold bg-primary/10 border border-primary/20 hover:bg-primary/20 px-2 py-1 rounded transition-colors"
                      onClick={() => handleViewCatalog(s.id, s.name)}
                    >
                      {s.partCount || 0} parts
                    </button>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-2">
                        {s.isActive && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1 text-xs border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary" 
                            onClick={() => handleOpenAddPart(s)}
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Part
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleOpenEdit(s)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => handleDeleteClick(s)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* VENDOR PROFILE MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!max-w-3xl w-[92vw] overflow-hidden overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
            <DialogDescription>{editingSupplier ? 'Update the vendor details.' : 'Fill in the details to add a new vendor.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 py-0.5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-x-5">
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 bg-background/50 focus:border-primary transition-all" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Acme Global Logistics" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Contact Person</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 bg-background/50" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required placeholder="Full name" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 bg-background/50" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="logistics@partner.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input className="pl-10 bg-background/50" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+977..." />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Status</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={form.isActive ? 'true' : 'false'}
                      onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Website</Label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 bg-background/50" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="www.partner.com" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Tax ID / PAN</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 bg-background/50" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} placeholder="e.g. 601234567" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <textarea className="flex min-h-[78px] w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required placeholder="Full business operations address..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Section at the bottom */}
            <div className="min-w-0 space-y-1.5 border-t border-border/30 pt-1.5">
              <Label className="text-sm font-medium">Categories (select all that apply)</Label>
              <div className="rounded-xl border border-border bg-muted/5 p-1.5">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 md:grid-cols-3">
                  {PRESET_CATEGORIES.map((cat) => {
                    const isSelected = form.category.split(',').map((c) => c.trim()).includes(cat);
                    return (
                      <label key={cat} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2 py-1 text-sm text-foreground transition-colors hover:bg-muted/70">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCategory(cat)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="truncate">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {form.category
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean)
                  .map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
                    >
                      {cat}
                    </span>
                  ))}
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border/30">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : editingSupplier ? 'Save Changes' : 'Add Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Vendor
            </DialogTitle>
            <DialogDescription>
              {supplierToDelete ? `Delete ${supplierToDelete.name}? This cannot be undone.` : 'Delete this vendor?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VENDOR-SPECIFIC ADD PART MODAL */}
      <Dialog open={isAddPartOpen} onOpenChange={setIsAddPartOpen}>
        <DialogContent className="!max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b border-border/50">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Add Product for {selectedVendorForPart?.name}
            </DialogTitle>
            <DialogDescription>
              Register a component directly mapping it to this vendor partner's catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePartSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Product Info Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-medium">Product Name</Label>
                    <Input 
                      value={partForm.name} 
                      onChange={(e) => setPartForm({ ...partForm, name: e.target.value })} 
                      required 
                      placeholder="e.g. Android Stereo 10-inch" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">SKU</Label>
                    <Input 
                      value={partForm.sku} 
                      onChange={(e) => setPartForm({ ...partForm, sku: e.target.value })} 
                      required 
                      placeholder="e.g. TY-HL-STR-001" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                      value={partForm.categoryId} 
                      onChange={(e) => setPartForm({ ...partForm, categoryId: e.target.value })} 
                      required
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Compatibility Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vehicle Compatibility</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Car Company / Brand</Label>
                    <Input 
                      value={partForm.brand} 
                      onChange={(e) => setPartForm({ ...partForm, brand: e.target.value })} 
                      placeholder="e.g. Toyota" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Car Model (Compatibility)</Label>
                    <Input 
                      value={partForm.compatibleVehicleModel} 
                      onChange={(e) => setPartForm({ ...partForm, compatibleVehicleModel: e.target.value })} 
                      placeholder="e.g. Hilux" 
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock Details */}
              <div className="space-y-4 p-4 border border-border rounded-xl bg-muted/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Pricing Structure</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cost Price (NPR)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={partForm.costPrice} 
                      onChange={(e) => setPartForm({ ...partForm, costPrice: e.target.value })} 
                      required 
                      placeholder="0.00" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Margin Type</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                      value={partForm.marginType} 
                      onChange={(e) => setPartForm({ ...partForm, marginType: e.target.value })}
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed Amount">Fixed Amount (NPR)</option>
                    </select>
                  </div>
                  {partForm.marginType === 'Percentage' ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Margin (%)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={partForm.marginPercentage} 
                        onChange={(e) => setPartForm({ ...partForm, marginPercentage: e.target.value })} 
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Margin Amount (NPR)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={partForm.marginAmount} 
                        onChange={(e) => setPartForm({ ...partForm, marginAmount: e.target.value })} 
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-primary">Selling Price (NPR) (Calculated)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={partForm.sellingPrice} 
                      readOnly
                      className="bg-muted/80 font-bold border-primary/30"
                    />
                  </div>
                </div>
              </div>

              {/* Logistics & Stock */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Inventory & Logistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Initial Stock Quantity</Label>
                    <Input 
                      type="number" 
                      value={partForm.stockQuantity} 
                      onChange={(e) => setPartForm({ ...partForm, stockQuantity: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Min Stock Alert Level</Label>
                    <Input 
                      type="number" 
                      value={partForm.minimumStockAlertLevel} 
                      onChange={(e) => setPartForm({ ...partForm, minimumStockAlertLevel: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Minimum Order Quantity (MOQ)</Label>
                    <Input 
                      type="number" 
                      value={partForm.minimumOrderQuantity} 
                      onChange={(e) => setPartForm({ ...partForm, minimumOrderQuantity: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Delivery Lead Time</Label>
                    <Input 
                      value={partForm.deliveryTime} 
                      onChange={(e) => setPartForm({ ...partForm, deliveryTime: e.target.value })} 
                      placeholder="e.g. 2-3 Days" 
                    />
                  </div>
                </div>
              </div>

              {/* Image & Description */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Media & Description</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-dashed border-border flex items-center gap-6 bg-muted/10">
                    <div className="w-24 h-24 rounded-lg bg-card border border-border shadow-inner flex items-center justify-center overflow-hidden shrink-0">
                      {partPreviewUrl ? <img src={partPreviewUrl} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 opacity-10" />}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Label className="cursor-pointer">
                          <div className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:opacity-80 transition-opacity">
                            <Upload className="w-4 h-4" /> Local File Upload
                          </div>
                          <Input type="file" className="hidden" accept="image/*" onChange={handlePartFileChange} />
                        </Label>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{partImageFile ? partImageFile.name : 'No file selected'}</span>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Or paste image URL</Label>
                        <Input value={partForm.imageUrl} onChange={(e) => { setPartForm({ ...partForm, imageUrl: e.target.value }); setPartImageFile(null); setPartPreviewUrl(e.target.value); }} placeholder="https://..." className="h-8 text-xs bg-background/30" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Warranty Period</Label>
                    <Input 
                      value={partForm.warrantyPeriod} 
                      onChange={(e) => setPartForm({ ...partForm, warrantyPeriod: e.target.value })} 
                      placeholder="e.g. 1 Year" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Extra Notes / Description</Label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                      value={partForm.description} 
                      onChange={(e) => setPartForm({ ...partForm, description: e.target.value })} 
                      placeholder="Enter part notes, dimensions, or other details..." 
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t border-border bg-muted/20">
              <Button type="button" variant="outline" onClick={() => setIsAddPartOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={partSubmitting}>
                {partSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Register Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VENDOR CATALOG DIALOG */}
      <Dialog open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
        <DialogContent className="!max-w-4xl glass-card border-white/10 shadow-2xl p-0">
          <DialogHeader className="p-6 border-b border-border/50">
            <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              {currentVendorName}'s Catalog
            </DialogTitle>
            <DialogDescription>
              Detailed listing of all spare parts supplied by this vendor partner.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-6">
            {selectedVendorParts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No parts currently mapped to this vendor.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-muted-foreground">SKU</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Product Name</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Toyota Model</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Category</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Stock</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Cost (NPR)</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Price (NPR)</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedVendorParts.map(p => {
                    const profit = p.sellingPrice - p.costPrice;
                    return (
                      <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell><code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono font-semibold">{p.sku}</code></TableCell>
                        <TableCell className="font-medium text-sm">{p.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.compatibleVehicleModel || 'Universal'}</TableCell>
                        <TableCell className="text-sm">
                          <span className="text-[11px] border border-border/80 px-2 py-0.5 rounded bg-muted/20">{p.categoryName || 'General'}</span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{p.stockQuantity}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-semibold">NPR {p.costPrice?.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-semibold text-primary">NPR {p.sellingPrice?.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-semibold text-green-600 dark:text-green-400">
                          NPR {profit?.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter className="p-4 border-t border-border bg-muted/10">
            <Button variant="outline" onClick={() => setIsCatalogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;
