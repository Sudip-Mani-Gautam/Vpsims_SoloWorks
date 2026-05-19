import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Send, Paperclip, Download, FileText, Image as ImgIcon,
  MoreVertical, Check, CheckCheck, Plus, Shield, Clock,
  Loader2, X, ChevronLeft, ChevronRight, UserCircle,
  CheckCircle2, Circle, Copy, Trash2, Printer, AlertCircle, RefreshCw
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Interfaces ──────────────────────────────────────────────────────────────
interface Attachment { id: number; fileUrl: string; fileName: string; fileType: string; }
interface Message {
  id: number; senderId: number;
  sender: { name: string; role: string };
  text: string; isRead: boolean; createdAt: string;
  attachments: Attachment[];
}
interface Ticket {
  id: number; userId: number;
  user: { name: string; email: string };
  assignedStaffId?: number;
  assignedStaff?: { name: string; role: string };
  subject: string; issueType: string;
  status: string; priority: string;
  createdAt: string; updatedAt: string;
  unreadCount?: number; messages?: Message[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (d?: string, f = "MMM d, yyyy, h:mm a") => {
  if (!d) return "N/A";
  const p = parseISO(d);
  return isValid(p) ? format(p, f) : "N/A";
};
const avatarColor = (name: string) => {
  const colors = ["bg-orange-500", "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-pink-500", "bg-indigo-500"];
  return colors[name.charCodeAt(0) % colors.length];
};
const statusBadge = (s: string) => {
  const l = s?.toLowerCase() || "";
  if (l === "open") return <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded px-2 py-0.5">Open</span>;
  if (l === "inprogress") return <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5">In Progress</span>;
  if (l === "resolved") return <span className="text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded px-2 py-0.5">Resolved</span>;
  if (l === "closed") return <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5">Closed</span>;
  if (l === "replied") return <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5">Replied</span>;
  return <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded px-2 py-0.5">{s}</span>;
};
const priorityBadge = (p: string) => {
  const l = p.toLowerCase();
  if (l === "medium") return <span className="text-xs font-bold text-white bg-blue-500 rounded px-2 py-0.5">Medium</span>;
  if (l === "high") return <span className="text-xs font-bold text-white bg-orange-500 rounded px-2 py-0.5">High</span>;
  if (l === "urgent") return <span className="text-xs font-bold text-white bg-red-500 rounded px-2 py-0.5">Urgent</span>;
  return <span className="text-xs font-bold text-white bg-gray-400 rounded px-2 py-0.5">{p}</span>;
};

// ── Main Component ───────────────────────────────────────────────────────────
const SupportWorkspace = ({ role = "Customer", initialSelectedId }: { role?: "Customer" | "Admin" | "Staff"; initialSelectedId?: number }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(initialSelectedId || null);
  const [staffView, setStaffView] = useState<'assigned' | 'all'>('assigned');
  const [statusFilter, setStatusFilter] = useState("All");
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [leftW, setLeftW] = useState(300);
  const [rightW, setRightW] = useState(300);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = (side: "left" | "right") => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = side === "left" ? leftW : rightW;
    const onMove = (mv: MouseEvent) => {
      const delta = mv.clientX - startX;
      if (side === "left") setLeftW(Math.max(220, Math.min(480, startW + delta)));
      else setRightW(Math.max(220, Math.min(480, startW - delta)));
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const endpoint = role === "Customer" ? "/support/my" : role === "Admin" ? "/support/all" : staffView === "assigned" ? "/support/assigned" : "/support/all";
  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ["support-tickets-list", role, staffView],
    queryFn: async () => { const { data } = await api.get(endpoint); return data; },
    refetchInterval: 15000,
  });
  const { data: activeTicket } = useQuery<Ticket>({
    queryKey: ["support-ticket-detail", selectedId],
    queryFn: async () => { 
      if (!selectedId) return null as any; 
      const { data } = await api.get(`/support/ticket/${selectedId}`); 
      window.dispatchEvent(new Event('refetchUnread'));
      return data; 
    },
    enabled: !!selectedId, refetchInterval: 5000,
  });

  useEffect(() => { if (!selectedId && tickets.length > 0) setSelectedId(tickets[0].id); }, [tickets, selectedId]);
  useEffect(() => {
    if (scrollRef.current) {
      const v = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (v) v.scrollTop = v.scrollHeight;
    }
  }, [activeTicket?.messages]);

  const sendMutation = useMutation({
    mutationFn: (p: any) => api.post(`/support/ticket/${selectedId}/message`, p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["support-ticket-detail", selectedId] }); setNewMessage(""); setAttachments([]); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/support/ticket/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets-list"] });
      queryClient.invalidateQueries({ queryKey: ["support-ticket-detail", selectedId] });
      toast.success("Ticket status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleSend = (e: React.FormEvent) => { e.preventDefault(); if (!newMessage.trim() && !attachments.length) return; sendMutation.mutate({ text: newMessage, attachmentUrls: attachments }); };
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploading(true);
    try { const fd = new FormData(); fd.append("file", file); const { data } = await api.post("/upload/support-attachment", fd); setAttachments(p => [...p, data.url]); toast.success("File attached"); }
    catch { toast.error("Upload failed"); } finally { setIsUploading(false); }
  };

  // counts
  const counts = {
    All: tickets.length,
    Open: tickets.filter(t => t.status.toLowerCase() === "open").length,
    InProgress: tickets.filter(t => t.status.toLowerCase() === "inprogress").length,
    Resolved: tickets.filter(t => t.status.toLowerCase() === "resolved").length,
    Closed: tickets.filter(t => t.status.toLowerCase() === "closed").length,
    Replied: tickets.filter(t => t.status.toLowerCase() === "replied").length,
  };
  const filtered = tickets.filter(t =>
    statusFilter === "All" || t.status.toLowerCase().replace(" ", "") === statusFilter.toLowerCase()
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTickets = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <div ref={containerRef} className="flex h-[calc(100vh-64px)] bg-background overflow-hidden -m-6 select-none">
      {/* ── LEFT: Ticket List ─────────────────────────────── */}
      <div style={{ width: leftW, minWidth: 220, maxWidth: 480 }} className="flex flex-col border-r border-border bg-card shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-bold text-foreground text-lg tracking-tight">
            {role === "Customer" ? "My Tickets" : role === "Admin" ? "All Tickets" : "Help Desk"}
          </span>
          {role === "Customer" && (
            <button onClick={() => setIsNewTicketOpen(true)} className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-sm transition-all active:scale-95">
              <Plus className="w-4 h-4" /> New Ticket
            </button>
          )}
        </div>

        {/* Staff View Toggle */}
        {role === "Staff" && (
          <div className="px-5 py-2.5 border-b border-border/60 bg-muted/10">
            <div className="grid grid-cols-2 gap-1 bg-muted p-0.5 rounded-lg border border-border/40">
              <button
                type="button"
                onClick={() => {
                  setStaffView("assigned");
                  setSelectedId(null);
                }}
                className={cn(
                  "py-1 text-xs font-bold rounded-md transition-all",
                  staffView === "assigned" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Assigned to Me
              </button>
              <button
                type="button"
                onClick={() => {
                  setStaffView("all");
                  setSelectedId(null);
                }}
                className={cn(
                  "py-1 text-xs font-bold rounded-md transition-all",
                  staffView === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Tickets
              </button>
            </div>
          </div>
        )}
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-border px-3 py-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          {([
            { key: "All", label: "All", count: counts.All }, 
            { key: "Open", label: "Open", count: counts.Open }, 
            { key: "InProgress", label: "In Prog", count: counts.InProgress }, 
            { key: "Replied", label: "Replied", count: counts.Replied },
            { key: "Resolved", label: "Done", count: counts.Resolved },
            { key: "Closed", label: "Closed", count: counts.Closed }
          ]).map(({ key, label, count }) => {
            const active = statusFilter === key;
            return (
              <button key={key} onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-tight transition-all whitespace-nowrap ${active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                {label}
                <span className={`text-[9px] font-black rounded-full px-1.5 py-0.5 ${active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        {/* Ticket Cards */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {paginatedTickets.map((t) => {
              const isUnread = (t.unreadCount ?? 0) > 0;
              const isSelected = selectedId === t.id;
              
              return (
              <div key={t.id} onClick={() => {
                setSelectedId(t.id);
                if ((t.unreadCount ?? 0) > 0) {
                  window.dispatchEvent(new Event('optimisticSupportRead'));
                  queryClient.setQueryData(["support-tickets-list", role, staffView], (old: any) => {
                    if (!old) return old;
                    return old.map((tick: any) => tick.id === t.id ? { ...tick, unreadCount: 0 } : tick);
                  });
                }
              }}
                className={cn(
                  "px-5 py-4 cursor-pointer relative transition-all border-b border-border/40 last:border-0",
                  isSelected 
                    ? "bg-primary/5" 
                    : isUnread 
                      ? "bg-muted/70 hover:bg-muted" 
                      : "hover:bg-muted/40"
                )}>
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r" />}
                {isUnread && <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card shadow-sm" />}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[11px] uppercase tracking-wide truncate pr-6",
                      isUnread && !isSelected ? "font-black text-foreground" : "font-bold text-primary"
                    )}>
                      #{t.id} {t.subject}
                    </span>
                  </div>
                  <p className={cn(
                    "text-[13px] leading-relaxed line-clamp-2",
                    isSelected ? "text-foreground font-medium" : isUnread ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}>
                    {t.messages?.[0]?.text || t.issueType}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={cn(
                      "text-[10px] uppercase tracking-tighter",
                      isUnread && !isSelected ? "font-bold text-foreground/70" : "font-medium text-muted-foreground/60"
                    )}>{fmt(t.createdAt, "MMM d, h:mm a")}</span>
                    {statusBadge(t.status)}
                  </div>
                </div>
              </div>
            )})}
          </div>
          {filtered.length > 0 && (
            <div className="p-4 border-t border-border flex items-center justify-between bg-card/80 backdrop-blur-sm sticky bottom-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold transition-all",
                      currentPage === page
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {page}
                  </button>
                ))}
                {currentPage < totalPages && (
                  <button 
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ── LEFT DRAG HANDLE ── */}
      <div
        onMouseDown={startResize("left")}
        className="w-1 bg-border hover:bg-primary/60 cursor-col-resize transition-colors shrink-0 relative group"
        title="Drag to resize"
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      {/* ── CENTER + RIGHT ────────────────────────────────── */}
      <CenterAndRight
        activeTicket={activeTicket}
        role={role}
        user={user}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        attachments={attachments}
        setAttachments={setAttachments}
        isUploading={isUploading}
        sendMutation={sendMutation}
        handleSend={handleSend}
        handleFile={handleFile}
        fileInputRef={fileInputRef}
        scrollRef={scrollRef}
        queryClient={queryClient}
        selectedId={selectedId}
        rightW={rightW}
        startResizeRight={startResize("right")}
        showRightPanel={showRightPanel}
        setShowRightPanel={setShowRightPanel}
        updateStatusMutation={updateStatusMutation}
      />

      {/* New Ticket Dialog */}
      <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Support Ticket</DialogTitle></DialogHeader>
          <CustomerSupportForm onSuccess={() => { setIsNewTicketOpen(false); queryClient.invalidateQueries({ queryKey: ["support-tickets-list"] }); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportWorkspace;

// ── Center + Right ───────────────────────────────────────────────────────────
const CenterAndRight = ({ activeTicket, role, user, newMessage, setNewMessage, attachments, setAttachments, isUploading, sendMutation, handleSend, handleFile, fileInputRef, scrollRef, queryClient, selectedId, rightW = 300, startResizeRight, showRightPanel, setShowRightPanel, updateStatusMutation }: any) => {
  if (!activeTicket) return (
    <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">Select a ticket to view conversation</div>
  );

  const { data: staffMembers = [] } = useQuery<any[]>({
    queryKey: ["staff-members-list"],
    queryFn: async () => {
      const { data } = await api.get("/user/role/Staff");
      return data;
    },
    enabled: role === "Admin" || role === "Staff",
  });

  const assignMutation = useMutation({
    mutationFn: ({ ticketId, staffId }: { ticketId: number; staffId: number | null }) => 
      api.patch(`/support/ticket/${ticketId}/assign`, { staffId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets-list"] });
      queryClient.invalidateQueries({ queryKey: ["support-ticket-detail", selectedId] });
      toast.success("Ticket assignment updated");
    },
    onError: () => toast.error("Failed to update ticket assignment"),
  });

  const isAssigned = !!activeTicket.assignedStaffId;
  const isUserStaff = user?.role === "Staff" || user?.role === "staff";
  const isAssignedStaff = isUserStaff && user?.id === activeTicket.assignedStaffId;
  const isUserAdmin = user?.role === "Admin" || user?.role === "admin";
  const isUserCustomer = user?.role === "Customer" || user?.role === "customer";
  
  const canChat = !isAssigned || isUserAdmin || isUserCustomer || isAssignedStaff;
  const messages: Message[] = activeTicket.messages || [];
  // group messages by date
  const grouped: { date: string; msgs: Message[] }[] = [];
  messages.forEach(m => {
    const d = fmt(m.createdAt, "MMMM d, yyyy");
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) last.msgs.push(m);
    else grouped.push({ date: d, msgs: [m] });
  });

  const allAttachments = messages.flatMap(m => m.attachments || []);

  return (
    <div className="flex flex-1 min-w-0 overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-base font-bold text-foreground truncate flex items-center gap-2">
              <span className="text-muted-foreground font-mono text-sm">#{activeTicket.id}</span>
              <span className="text-border">•</span>
              <span className="truncate">{activeTicket.subject}</span>
            </h2>
            <div className="ml-2">
              {statusBadge(activeTicket.status)}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!activeTicket.assignedStaffId && isUserStaff && (
              <button
                type="button"
                onClick={() => assignMutation.mutate({ ticketId: activeTicket.id, staffId: user.id })}
                className="flex items-center justify-center text-[11px] font-bold uppercase tracking-wider rounded-lg px-4 py-2 bg-primary hover:bg-primary/95 text-white transition-all active:scale-95 shadow-sm"
              >
                Claim Ticket
              </button>
            )}

            {activeTicket.assignedStaffId === user.id && isUserStaff && (
              <button
                type="button"
                onClick={() => assignMutation.mutate({ ticketId: activeTicket.id, staffId: null })}
                className="flex items-center justify-center text-[11px] font-bold uppercase tracking-wider rounded-lg px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all active:scale-95 shadow-sm"
              >
                Release Ticket
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={cn(
                "flex items-center justify-center text-[11px] font-bold uppercase tracking-wider rounded-lg px-4 py-2 transition-all active:scale-95 border min-w-[140px]",
                showRightPanel
                  ? "text-orange-600 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20"
                  : "text-green-600 bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
              )}
            >
              {showRightPanel ? "Hide Details" : "Show Ticket Details"}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-full transition-colors outline-none">
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Ticket Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(activeTicket.id.toString());
                  toast.success("Ticket ID copied");
                }}>
                  <Copy className="w-4 h-4 mr-2" /> Copy Ticket ID
                </DropdownMenuItem>

                {activeTicket.status.toLowerCase() !== "resolved" ? (
                  <DropdownMenuItem
                    className="text-green-600 focus:text-green-600"
                    onClick={() => updateStatusMutation.mutate({ id: activeTicket.id, status: "Resolved" })}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Resolved
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => updateStatusMutation.mutate({ id: activeTicket.id, status: "InProgress" })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Reopen Ticket
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => updateStatusMutation.mutate({ id: activeTicket.id, status: "Closed" })}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Close & Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 bg-muted/10">
          <div className="flex flex-col p-4 gap-4">
            {grouped.map(({ date, msgs }) => (
              <div key={date} className="space-y-4">
                {/* Modern Date Separator */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <span className="relative px-3 py-0.5 rounded-full bg-muted/50 text-[9px] font-bold text-muted-foreground uppercase tracking-widest backdrop-blur-sm border border-border/50">
                    {date}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {msgs.map(msg => {
                    const isStaff = msg.sender.role === "Admin" || msg.sender.role === "Staff";
                    const initials = msg.sender.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <div key={msg.id} className={cn("flex gap-2 group", isStaff ? "flex-row-reverse" : "flex-row")}>
                        {/* Avatar */}
                        <div className="shrink-0 mt-0.5">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-background", avatarColor(msg.sender.name))}>
                            {initials}
                          </div>
                        </div>

                        <div className={cn("flex flex-col max-w-[85%]", isStaff ? "items-end" : "items-start")}>
                          {/* Message Header */}
                          <div className={cn("flex items-center gap-1.5 mb-0.5 px-0.5", isStaff ? "flex-row-reverse" : "flex-row")}>
                            <span className="text-[10px] font-bold text-foreground/70">
                              {isStaff ? "STAFF" : msg.sender.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground/50">{fmt(msg.createdAt, "h:mm a")}</span>
                          </div>

                          {/* Bubble */}
                          <div className={cn(
                            "relative px-3 py-2 rounded-xl text-[12px] leading-snug shadow-sm border",
                            isStaff 
                              ? "bg-primary text-primary-foreground rounded-tr-none border-primary/20" 
                              : "bg-card text-foreground rounded-tl-none border-border"
                          )}>
                            {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                            
                            {/* Attachments */}
                            {msg.attachments?.length > 0 && (
                              <div className="mt-2 space-y-1.5">
                                {msg.attachments.map(att => (
                                  <div key={att.id} 
                                    onClick={() => window.open(`${API_BASE_URL}${att.fileUrl}`, "_blank")}
                                    className={cn(
                                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer border transition-all active:scale-[0.98]",
                                      isStaff 
                                        ? "bg-white/10 border-white/20 hover:bg-white/20" 
                                        : "bg-muted/50 border-border hover:bg-muted"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-7 h-7 rounded flex items-center justify-center shrink-0",
                                      att.fileType === "PDF" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                                    )}>
                                      {att.fileType === "PDF" ? <FileText className="w-3.5 h-3.5" /> : <ImgIcon className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={cn("text-[10px] font-bold truncate", isStaff ? "text-white" : "text-foreground")}>{att.fileName}</p>
                                      <p className={cn("text-[8px] uppercase font-bold tracking-tighter opacity-70", isStaff ? "text-white/80" : "text-muted-foreground")}>{att.fileType || "File"}</p>
                                    </div>
                                    <Download className={cn("w-3 h-3 transition-colors", isStaff ? "text-white/50 group-hover:text-white" : "text-muted-foreground group-hover:text-primary")} />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Status Footer */}
                            <div className={cn("flex justify-end mt-1 opacity-60", isStaff ? "text-white" : "text-muted-foreground")}>
                              {isStaff ? (
                                msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Sleek Input Bar (Minimized) */}
        <div className="px-5 py-3 bg-card/50 backdrop-blur-md border-t border-border shrink-0">
          {!canChat ? (
            <div className="flex items-center justify-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-semibold gap-2 animate-in fade-in slide-in-from-bottom-2">
              <Shield className="w-4 h-4 shrink-0 text-orange-500" />
              <span>This ticket is assigned to <strong>{activeTicket.assignedStaff?.name || "another staff member"}</strong>. Only the assigned staff member or an Admin can respond.</span>
            </div>
          ) : (
            <>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((_, i) => (
                    <div key={i} className="flex items-center gap-2 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-bottom-2">
                      <Paperclip className="w-3 h-3" />
                      <span>File {i + 1}</span>
                      <button onClick={() => setAttachments((p: string[]) => p.filter((_: string, j: number) => j !== i))}
                        className="hover:text-red-500 transition-colors ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <form onSubmit={handleSend} 
                className="flex items-center gap-2 p-1 pl-3 bg-background border border-border rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all shadow-sm">
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFile} />
                <button type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
                
                <input
                  className="flex-1 text-[13px] font-medium outline-none border-0 focus:ring-0 bg-transparent placeholder:text-muted-foreground/40 text-foreground"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                />
                
                <button type="submit"
                  disabled={sendMutation.isPending || isUploading || (!newMessage.trim() && !attachments.length)}
                  className="h-8 px-4 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center text-primary-foreground transition-all shadow active:scale-95 shrink-0 font-bold text-[11px] gap-1.5">
                  {sendMutation.isPending || isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                    <>
                      <span>Send</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT DRAG HANDLE ── */}
      {showRightPanel && (
        <div
          onMouseDown={startResizeRight}
          className="w-1 bg-border hover:bg-primary/60 cursor-col-resize transition-colors shrink-0 relative"
          title="Drag to resize"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>
      )}

      {/* ── RIGHT: Ticket Info ──────────────────────────── */}
      {showRightPanel && (
        <div style={{ width: rightW, minWidth: 220, maxWidth: 480 }} className="shrink-0 bg-card overflow-y-auto border-l border-border">
          {/* Ticket Information */}
          <div className="px-6 py-6 border-b border-border">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="font-bold text-sm text-foreground">Ticket Information</span>
            </div>
            <div className="space-y-5">
              <InfoRow label="Ticket ID" value={<span className="font-bold text-foreground">#{activeTicket.id}</span>} />
              <InfoRow label="Status" value={
                role !== "Customer" ? (
                  <Select 
                    value={activeTicket.status} 
                    onValueChange={(v) => updateStatusMutation.mutate({ id: activeTicket.id, status: v })}
                  >
                    <SelectTrigger className="h-7 text-xs font-bold w-[120px] bg-background border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="InProgress">In Progress</SelectItem>
                      <SelectItem value="Replied">Replied</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  statusBadge(activeTicket.status)
                )
              } />
              <InfoRow label="Category" value={<span className="text-foreground">{activeTicket.issueType}</span>} />
              <InfoRow label="Priority" value={priorityBadge(activeTicket.priority)} />
              <InfoRow label="Created On" value={fmt(activeTicket.createdAt, "MMM d, yyyy, h:mm a")} />
              <InfoRow label="Assigned To" value={
                (role === "Admin" || role === "Staff") ? (
                  <Select 
                    value={activeTicket.assignedStaffId?.toString() || "unassigned"}
                    onValueChange={(val) => {
                      const staffId = val === "unassigned" ? null : parseInt(val);
                      assignMutation.mutate({ ticketId: activeTicket.id, staffId });
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs font-bold w-[150px] bg-background border-border">
                      <SelectValue placeholder="Assign Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {staffMembers.map((s: any) => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-lg border border-border">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                      {activeTicket.assignedStaff?.name?.[0] || "S"}
                    </div>
                    <span className="text-[12px] font-bold text-foreground">{activeTicket.assignedStaff?.name || "Unassigned"}</span>
                  </div>
                )
              } />
              
              {role === "Customer" && activeTicket.status.toLowerCase() !== "closed" && activeTicket.status.toLowerCase() !== "resolved" && (
                <div className="pt-2">
                  <Button 
                    onClick={() => updateStatusMutation.mutate({ id: activeTicket.id, status: "Resolved" })}
                    className="w-full text-xs font-bold uppercase tracking-wider h-9 bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center justify-center gap-1.5 border-0 outline-none"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Resolved
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="px-6 py-6 border-b border-border">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Paperclip className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-sm text-foreground">Attachments</span>
            </div>
            <div className="space-y-3">
              {allAttachments.length > 0 ? allAttachments.map(att => (
                <div key={att.id}
                  onClick={() => window.open(`${API_BASE_URL}${att.fileUrl}`, "_blank")}
                  className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border group cursor-pointer hover:border-primary/50 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm border border-border">
                    {att.fileType === "PDF" ? <FileText className="w-5 h-5 text-red-500" /> : <ImgIcon className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate">{att.fileName}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{att.fileType || "File"}</p>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              )) : (
                <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
                  <Paperclip className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[11px] font-medium text-muted-foreground">No attachments shared yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          <div className="px-6 py-6 border-b border-border">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-sm text-foreground">Status History</span>
            </div>
            <div className="space-y-6 relative ml-2">
              <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-border" />
              <div className="flex gap-4 relative z-10">
                <div className="w-3 h-3 rounded-full bg-primary border-2 border-background shadow-sm mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{fmt(activeTicket.createdAt, "MMM d, yyyy, h:mm a")}</p>
                  <p className="text-[12px] font-bold text-foreground mt-0.5">Ticket created</p>
                </div>
              </div>
              <div className="flex gap-4 relative z-10">
                <div className="w-3 h-3 rounded-full bg-muted border-2 border-background shadow-sm mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{fmt(activeTicket.updatedAt, "MMM d, yyyy, h:mm a")}</p>
                  <p className="text-[12px] font-bold text-foreground mt-0.5">Assigned to STAFF (Admin)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Response Time Box */}
          <div className="p-6">
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm shrink-0 border border-border">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-foreground">Response Time</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Our team typically responds within <span className="text-primary font-bold">2-4 business hours.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-2">
    <span className="text-[11px] text-muted-foreground shrink-0">{label}</span>
    <div className="text-[12px] text-foreground font-medium text-right">{value}</div>
  </div>
);

// ── New Ticket Form ───────────────────────────────────────────────────────────
const CustomerSupportForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [form, setForm] = useState({ subject: "", issueType: "General Inquiry", priority: "Medium", message: "" });
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const createMutation = useMutation({
    mutationFn: (p: any) => api.post("/support/ticket", p),
    onSuccess: () => { toast.success("Ticket created!"); onSuccess(); },
    onError: () => toast.error("Failed to create ticket"),
  });
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploading(true);
    try { const fd = new FormData(); fd.append("file", file); const { data } = await api.post("/upload/support-attachment", fd); setAttachments(p => [...p, data.url]); toast.success("Attached"); }
    catch { toast.error("Upload failed"); } finally { setIsUploading(false); }
  };
  return (
    <form onSubmit={e => { e.preventDefault(); createMutation.mutate({ ...form, attachmentUrls: attachments }); }} className="space-y-4 mt-2">
      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Subject</Label>
        <Input placeholder="What's the issue?" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Category</Label>
          <Select value={form.issueType} onValueChange={v => setForm({ ...form, issueType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["General Inquiry", "Payment Issue", "Invoice Issue", "Booking Issue", "Part Request", "Complaint", "Technical Issue"].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Priority</Label>
          <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Low", "Medium", "High", "Urgent"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Message</Label>
        <textarea required rows={4} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="Describe your issue..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
      </div>
      <div className="flex items-center gap-2">
        <input type="file" className="hidden" ref={fileRef} onChange={handleFile} />
        <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50">
          <Paperclip className="w-3.5 h-3.5" /> {isUploading ? "Uploading..." : "Attach File"}
        </button>
        {attachments.length > 0 && <span className="text-xs text-blue-600">{attachments.length} file(s) attached</span>}
      </div>
      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit Ticket
      </Button>
    </form>
  );
};
