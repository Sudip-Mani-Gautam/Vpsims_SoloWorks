import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { 
  HelpCircle, Plus, Edit2, Trash2, Loader2, Save, 
  ArrowUp, ArrowDown, ChevronLeft, X
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isPublished: boolean;
  hexColor?: string;
}

const emptyFAQ: Partial<FAQ> = {
  question: "",
  answer: "",
  category: "general",
  displayOrder: 0,
  isPublished: true,
  hexColor: "White"
};

const COLOR_MAP: Record<string, string> = {
  "white": "hsl(var(--card))",
  "blue": "hsl(217 91% 60% / 0.1)",
  "green": "hsl(142 71% 45% / 0.1)",
  "yellow": "hsl(38 92% 50% / 0.1)",
  "red": "hsl(0 72% 51% / 0.1)",
  "purple": "hsl(262 83% 58% / 0.1)",
  "gray": "hsl(var(--muted))"
};

const ACCENT_MAP: Record<string, string> = {
  "white": "hsl(var(--border))",
  "blue": "hsl(217 91% 60%)",
  "green": "hsl(142 71% 45%)",
  "yellow": "hsl(38 92% 50%)",
  "red": "hsl(0 72% 51%)",
  "purple": "hsl(262 83% 58%)",
  "gray": "hsl(215 16% 47%)"
};

const FAQManagement = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<FAQ>>(emptyFAQ);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: faqs = [], isLoading } = useQuery<FAQ[]>({
    queryKey: ["faqs-all"],
    queryFn: async () => {
      const { data } = await api.get("/faq/all");
      return data.sort((a: FAQ, b: FAQ) => a.displayOrder - b.displayOrder);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<FAQ>) => {
      const body = {
        ...payload,
        HexColor: payload.hexColor
      };
      return isEditMode ? api.put(`/faq/${payload.id}`, body) : api.post("/faq", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs-all"] });
      toast.success(isEditMode ? "FAQ Updated" : "FAQ Created");
      setIsOpen(false);
      setEditing(emptyFAQ);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Operation failed.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/faq/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs-all"] });
      toast.success("FAQ Deleted");
    },
  });

  const handleEdit = (faq: FAQ) => {
    setEditing(faq);
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleCreate = () => {
    setEditing(emptyFAQ);
    setIsEditMode(false);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleReorder = async (faq: FAQ, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? faq.displayOrder - 1 : faq.displayOrder + 1;
    try {
      await api.put(`/faq/${faq.id}`, { ...faq, HexColor: faq.hexColor, displayOrder: newOrder });
      queryClient.invalidateQueries({ queryKey: ["faqs-all"] });
    } catch {
      toast.error("Failed to reorder.");
    }
  };

  const getRowBg = (colorName?: string) => {
    if (!colorName) return COLOR_MAP["white"];
    const key = colorName.toLowerCase();
    return COLOR_MAP[key] || COLOR_MAP["white"];
  };

  const getAccentColor = (colorName?: string) => {
    if (!colorName) return ACCENT_MAP["white"];
    const key = colorName.toLowerCase();
    return ACCENT_MAP[key] || ACCENT_MAP["white"];
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-4 lg:p-8 bg-background min-h-screen text-foreground">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-all text-sm font-semibold shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <Button 
          onClick={handleCreate} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg px-6 py-2 h-11 flex items-center gap-2 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" /> Add FAQ
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-8">
         <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
            <HelpCircle className="w-7 h-7" />
         </div>
         <h1 className="text-3xl font-bold text-foreground tracking-tight">FAQ Management</h1>
      </div>

      <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="pl-8 py-4 font-semibold text-[11px] text-muted-foreground uppercase tracking-widest w-[120px]">Order</TableHead>
                <TableHead className="py-4 font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">Question</TableHead>
                <TableHead className="py-4 font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">Category</TableHead>
                <TableHead className="py-4 font-semibold text-[11px] text-muted-foreground uppercase tracking-widest w-[100px]">Color</TableHead>
                <TableHead className="pr-8 py-4 font-semibold text-[11px] text-muted-foreground uppercase tracking-widest text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="h-20">
                    <TableCell className="pl-8"><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                    <TableCell className="pr-8 text-right"><div className="flex justify-end gap-3"><Skeleton className="w-5 h-5 rounded" /><Skeleton className="w-5 h-5 rounded" /></div></TableCell>
                  </TableRow>
                ))
              ) : faqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">No FAQs found.</p>
                  </TableCell>
                </TableRow>
              ) : faqs.map((faq) => (
                <TableRow 
                  key={faq.id} 
                  style={{ backgroundColor: getRowBg(faq.hexColor) }}
                  className="border-b border-border transition-colors group"
                >
                  <TableCell className="pl-8 py-5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleReorder(faq, 'up')} className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleReorder(faq, 'down')} className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[15px] text-foreground leading-tight">{faq.question}</span>
                      <span className="text-[13px] text-muted-foreground line-clamp-1 opacity-80">{faq.answer}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-foreground font-bold text-[12px] lowercase tracking-tight">
                      {faq.category}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    <div 
                      className="w-8 h-8 rounded-md border border-border shadow-sm" 
                      style={{ backgroundColor: getAccentColor(faq.hexColor) }} 
                    />
                  </TableCell>
                  <TableCell className="pr-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button onClick={() => handleEdit(faq)} className="text-primary hover:text-primary/80 transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(faq.id)} className="text-destructive hover:text-destructive/80 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl rounded-lg p-0 overflow-hidden border-border shadow-2xl bg-card">
          <div className="p-8 relative">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {isEditMode ? "Edit FAQ" : "Add FAQ"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(editing); }} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Question</Label>
                <Input 
                  value={editing.question} 
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })} 
                  required 
                  className="h-11 border-input rounded-md focus:ring-primary bg-card text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Answer</Label>
                <textarea 
                  value={editing.answer} 
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })} 
                  required 
                  rows={4}
                  className="w-full border border-input rounded-md p-3 text-[14px] font-normal text-foreground bg-card outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Category</Label>
                  <Select 
                    value={editing.category || "general"} 
                    onValueChange={(val) => setEditing({ ...editing, category: val })}
                  >
                    <SelectTrigger className="h-11 border-input rounded-md bg-card text-foreground">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-border bg-card">
                      {["general", "Policies", "Parts", "Rewards", "Bookings", "Payments", "Account", "Support"].map(cat => (
                        <SelectItem key={cat} value={cat} className="cursor-pointer text-foreground hover:bg-muted">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Background Color</Label>
                  <Select 
                    value={editing.hexColor || "White"} 
                    onValueChange={(val) => setEditing({ ...editing, hexColor: val })}
                  >
                    <SelectTrigger className="h-11 border-input rounded-md bg-card text-foreground">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-border bg-card">
                      {Object.keys(ACCENT_MAP).map(color => (
                        <SelectItem key={color} value={color.charAt(0).toUpperCase() + color.slice(1)} className="cursor-pointer py-2 text-foreground hover:bg-muted">
                          <div className="flex items-center gap-3">
                             <div className="w-5 h-5 rounded-md border border-border shadow-sm" style={{ backgroundColor: ACCENT_MAP[color] }} />
                             <span className="capitalize">{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 px-8 rounded-md transition-all active:scale-95 shadow-lg" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQManagement;
