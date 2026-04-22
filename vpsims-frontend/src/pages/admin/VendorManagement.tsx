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
      toast.error("Failed to load vendor data from central registry.");
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
    if (!confirm('Permanently decommission this distribution partner?')) return;
    try {
      await api.delete(`/supplier/${id}`);
      toast.success("Partner removed from system.");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Decommission failed.');
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-black tracking-tight text-foreground">Vendors & Partners</h1>
          <p className="text-muted-foreground font-medium">Manage your external procurement and logistics network.</p>
        </div>
        {canEdit && (
          <Button onClick={handleOpenAdd} className="bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 hover-lift">
            <Plus className="w-4 h-4 mr-2" /> Register Partner
          </Button>
        )}
      </div>

      <div className="relative max-w-sm shadow-sm rounded-xl overflow-hidden group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          className="pl-11 h-11 bg-card border-border/50 focus:border-primary transition-all duration-300" 
          placeholder="Search partners by name or email..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <Card className="glass-card shadow-xl overflow-hidden border-border/40">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase tracking-wider pl-6">Partner Entity</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Primary Contact</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Connectivity</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Classification</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Supply Metrics</TableHead>
                {canEdit && <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-6">Management</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 5 : 4} className="h-64 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground font-medium">Synchronizing partner directory...</p>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={canEdit ? 5 : 4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <Truck className="w-12 h-12 text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground font-medium">No distribution partners found.</p>
                        </div>
                    </TableCell>
                </TableRow>
              ) : filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/20 transition-colors group">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-inner">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground leading-tight">{s.name}</p>
                            <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-wider flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5" /> Established Partner
                            </p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-black border border-border/50">
                            {s.contactName[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{s.contactName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <Phone className="w-3 h-3 text-muted-foreground" /> {s.phone}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-primary hover:underline cursor-pointer">
                            <Mail className="w-3 h-3" /> {s.email}
                        </div>
                        {s.website && (
                            <a href={s.website.startsWith('http') ? s.website : `https://${s.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">
                                <ExternalLink className="w-2.5 h-2.5" /> Website
                            </a>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-tighter bg-muted/50 border-border/50">
                            {s.category || 'General'}
                        </Badge>
                        <Badge variant={s.isActive ? "default" : "secondary"} className="text-[10px] uppercase font-black tracking-tighter ml-2 bg-success/20 text-success border-success/30">
                            {s.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {s.taxId && (
                            <p className="text-[10px] font-medium text-muted-foreground">VAT/PAN: {s.taxId}</p>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className="bg-success/5 text-success border-success/20 font-bold px-3 py-1 cursor-pointer hover:bg-success/10 transition-colors"
                      onClick={() => handleViewCatalog(s.id, s.name)}
                    >
                        {s.partCount || 0} Components mapped
                    </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleOpenEdit(s)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors text-destructive/70" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
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
        <DialogContent className="max-w-lg border-white/10 shadow-2xl rounded-2xl overflow-hidden glass-card p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/10">
            <DialogTitle className="text-2xl font-heading font-bold">{editingSupplier ? 'Update Partner Profile' : 'Register New Partner'}</DialogTitle>
            <DialogDescription>Input the organizational and contact details for the procurement registry.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company / Entity Name</Label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 bg-background/50 focus:border-primary transition-all" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Acme Global Logistics" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary Contact Person</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10 bg-background/50" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required placeholder="Full name" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact Phone</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10 bg-background/50" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+977..." />
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Business Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 bg-background/50" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="logistics@partner.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Website / URL</Label>
                    <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10 bg-background/50" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="www.partner.com" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tax ID / PAN Number</Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10 bg-background/50" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} placeholder="e.g. 601234567" />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vendor Category</Label>
                    <Input className="bg-background/50" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Engine Parts, Logistics" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Physical HQ Address</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required placeholder="Full business operations address..." />
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 bg-muted/5 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel Action</Button>
              <Button type="submit" className="bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : editingSupplier ? 'Apply Global Changes' : 'Register Distribution Partner'}
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
          <DialogFooter className="p-4 bg-muted/10 border-t border-border/50">
            <Button variant="outline" onClick={() => setIsCatalogOpen(false)}>Close Catalog</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;
