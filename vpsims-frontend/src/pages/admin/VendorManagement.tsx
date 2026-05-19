import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, Edit2, Trash2, Truck, X, Phone, Mail, MapPin, User, 
  Search, Loader2, Building2, ExternalLink
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

const emptyForm = { name: '', contactName: '', phone: '', email: '', address: '', website: '', taxId: '', category: '', isActive: true };

const VendorManagement = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'Staff';
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedVendorParts, setSelectedVendorParts] = useState<any[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [currentVendorName, setCurrentVendorName] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/supplier');
      setSuppliers(data);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load vendor data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setForm(emptyForm);
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

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this vendor?')) return;
    try {
      await api.delete(`/supplier/${id}`);
      toast.success("Vendor deleted.");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete vendor.');
    }
  };

  const handleViewCatalog = async (vendorId: number, vendorName: string) => {
    try {
      setCurrentVendorName(vendorName);
      const { data } = await api.get(`/part/supplier/${vendorId}`);
      setSelectedVendorParts(data);
      setIsCatalogOpen(true);
    } catch (e) {
      toast.error("Failed to load vendor catalog.");
    }
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
                <TableHead className="text-xs font-medium text-muted-foreground">Parts</TableHead>
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
                  <TableCell>
                    <button
                      className="text-xs text-primary hover:underline font-medium"
                      onClick={() => handleViewCatalog(s.id, s.name)}
                    >
                      {s.partCount || 0} parts
                    </button>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleOpenEdit(s)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
            <DialogDescription>{editingSupplier ? 'Update the vendor details.' : 'Fill in the details to add a new vendor.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Company Name</Label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 bg-background/50 focus:border-primary transition-all" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Acme Global Logistics" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Person</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10 bg-background/50" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required placeholder="Full name" />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Phone</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10 bg-background/50" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+977..." />
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 bg-background/50" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="logistics@partner.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Website</Label>
                    <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10 bg-background/50" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="www.partner.com" />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tax ID / PAN</Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10 bg-background/50" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} placeholder="e.g. 601234567" />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                    <Input className="bg-background/50" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Engine Parts, Logistics" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Address</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required placeholder="Full business operations address..." />
                </div>
              </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : editingSupplier ? 'Save Changes' : 'Add Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vendor Catalog Dialog */}
      <Dialog open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
        <DialogContent className="max-w-3xl glass-card border-white/10 shadow-2xl p-0">
          <DialogHeader className="p-6 border-b border-border/50">
            <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              {currentVendorName}'s Catalog
            </DialogTitle>
            <DialogDescription>
              List of all components supplied by this partner and their internal cost prices.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-6">
            {selectedVendorParts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No parts currently mapped to this vendor.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right font-bold text-success">Cost Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedVendorParts.map(p => (
                    <TableRow key={p.id}>
                      <TableCell><code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{p.sku}</code></TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.stockQuantity}</TableCell>
                      <TableCell className="text-right font-bold text-success tabular-nums">NPR {p.costPrice?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter className="p-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsCatalogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;
