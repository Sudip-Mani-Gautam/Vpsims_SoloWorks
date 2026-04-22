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
  Send, Paperclip, Download, FileText, Image as ImgIcon,
  MoreVertical, Check, CheckCheck, Plus, Shield, Clock,
  Loader2, X, ChevronLeft, ChevronRight, UserCircle,
  CheckCircle2, Circle
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { toast } from "sonner";

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
  const colors = ["bg-orange-500","bg-blue-500","bg-purple-500","bg-green-500","bg-pink-500","bg-indigo-500"];
  return colors[name.charCodeAt(0) % colors.length];
};
const statusBadge = (s: string) => {
  const l = s.toLowerCase();
  if (l === "open") return <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded px-2 py-0.5">Open</span>;
  if (l === "inprogress") return <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5">In Progress</span>;
  if (l === "resolved") return <span className="text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded px-2 py-0.5">Resolved</span>;
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
const SupportWorkspace = ({ role = "Customer", initialSelectedId }: { role?: "Customer"|"Admin"|"Staff"; initialSelectedId?: number }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number|null>(initialSelectedId||null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const endpoint = role === "Customer" ? "/support/my" : role === "Admin" ? "/support/all" : "/support/assigned";
  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ["support-tickets-list", role],
    queryFn: async () => { const { data } = await api.get(endpoint); return data; },
    refetchInterval: 15000,
  });
  const { data: activeTicket } = useQuery<Ticket>({
    queryKey: ["support-ticket-detail", selectedId],
    queryFn: async () => { if (!selectedId) return null as any; const { data } = await api.get(`/support/ticket/${selectedId}`); return data; },
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
  };
  const filtered = tickets.filter(t =>
    statusFilter === "All" || t.status.toLowerCase().replace(" ","") === statusFilter.toLowerCase()
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden -m-6">
      {/* ── LEFT: Ticket List ─────────────────────────────── */}
      <div className="w-[320px] flex flex-col border-r border-gray-200 bg-white shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-lg tracking-tight">All Tickets</span>
          <button onClick={() => setIsNewTicketOpen(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-sm transition-all active:scale-95">
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-100 px-3 py-2 overflow-x-auto no-scrollbar">
          {[["All", counts.All],["Open", counts.Open],["In Progress", counts.InProgress],["Resolved", counts.Resolved]].map(([label, count]) => {
            const key = String(label).replace(" ","");
            const active = statusFilter === key;
            return (
              <button key={String(label)} onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-tight transition-all ${active ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
                {label}
                <span className={`text-[9px] font-black rounded-full px-1.5 py-0.5 ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        {/* Ticket Cards */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-50">
            {filtered.map(t => (
              <div key={t.id} onClick={() => setSelectedId(t.id)}
                className={`px-5 py-5 cursor-pointer relative transition-all ${selectedId === t.id ? "bg-blue-50/50" : "hover:bg-gray-50/80"}`}>
                {selectedId === t.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
                {/* unread dot */}
                {(t.unreadCount ?? 0) > 0 && <div className="absolute top-6 right-5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white shadow-sm" />}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide truncate pr-6">
                      #{t.id} {t.subject}
                    </span>
                  </div>
                  <p className={`text-[13px] leading-relaxed line-clamp-2 ${selectedId === t.id ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                    {t.messages?.[0]?.text || t.issueType}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{fmt(t.createdAt, "MMM d, h:mm a")}</span>
                    {statusBadge(t.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky bottom-0">
               <span className="text-[10px] font-bold text-gray-400 uppercase">Showing 1 to {Math.min(7, filtered.length)} of {filtered.length}</span>
               <div className="flex items-center gap-1">
                  <button className="w-6 h-6 flex items-center justify-center rounded bg-blue-600 text-white text-[10px] font-bold">1</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-400 text-[10px] font-bold">2</button>
                  <ChevronRight className="w-3 h-3 text-gray-300 ml-1" />
               </div>
            </div>
          )}
        </ScrollArea>
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
const CenterAndRight = ({ activeTicket, role, user, newMessage, setNewMessage, attachments, setAttachments, isUploading, sendMutation, handleSend, handleFile, fileInputRef, scrollRef, queryClient, selectedId }: any) => {
  if (!activeTicket) return (
    <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">Select a ticket to view conversation</div>
  );
  const messages: Message[] = activeTicket.messages || [];
  // group messages by date
  const grouped: { date: string; msgs: Message[] }[] = [];
  messages.forEach(m => {
    const d = fmt(m.createdAt, "MMMM d, yyyy");
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) last.msgs.push(m);
    else grouped.push({ date: d, msgs: [m] });
  });

  return (
    <div className="flex flex-1 min-w-0 overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate flex items-center gap-2">
              <span className="text-gray-900">#{activeTicket.id}</span>
              <span className="text-gray-400 font-normal">•</span>
              <span className="truncate">{activeTicket.subject}</span>
            </h2>
            <div className="ml-2">
              {statusBadge(activeTicket.status)}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg px-4 py-2 transition-all active:scale-95">
              <UserCircle className="w-4 h-4" /> Assign To
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 bg-gray-50">
          <div className="px-6 py-4 space-y-4">
            {grouped.map(({ date, msgs }) => (
              <div key={date}>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] text-gray-400 font-medium">{date}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-3">
                  {msgs.map(msg => {
                    const isStaff = msg.sender.role === "Admin" || msg.sender.role === "Staff";
                    const initials = msg.sender.name.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase();
                    return (
                      <div key={msg.id} className={`flex gap-2.5 ${isStaff ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(msg.sender.name)}`}>
                          {initials}
                        </div>
                        <div className={`flex flex-col max-w-[70%] ${isStaff ? "items-end" : "items-start"}`}>
                          {/* Name + role + time */}
                          <div className={`flex items-center gap-2 mb-1 ${isStaff ? "flex-row-reverse" : ""}`}>
                            <span className="text-[11px] font-semibold text-gray-500">
                              {isStaff ? `STAFF (${msg.sender.role})` : msg.sender.name}
                            </span>
                            <span className="text-[10px] text-gray-400">{fmt(msg.createdAt, "h:mm a")}</span>
                          </div>
                          {/* Bubble */}
                          <div className={`relative px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                            isStaff ? "bg-blue-50 text-gray-800 rounded-tr-sm" : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                          }`}>
                            {msg.text && <p>{msg.text}</p>}
                            {/* Attachments in message */}
                            {msg.attachments?.length > 0 && (
                              <div className="mt-2 space-y-1.5">
                                {msg.attachments.map(att => (
                                  <div key={att.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-2 cursor-pointer hover:bg-gray-50"
                                    onClick={() => window.open(`${API_BASE_URL}${att.fileUrl}`, "_blank")}>
                                    <div className={`w-7 h-7 rounded flex items-center justify-center text-white shrink-0 ${att.fileType === "PDF" ? "bg-red-500" : "bg-sky-500"}`}>
                                      {att.fileType === "PDF" ? <FileText className="w-4 h-4" /> : <ImgIcon className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-semibold text-gray-700 truncate">{att.fileName}</p>
                                      <p className="text-[10px] text-gray-400">Document</p>
                                    </div>
                                    <Download className="w-3.5 h-3.5 text-gray-400" />
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Read tick */}
                            <div className={`flex justify-end mt-1 ${isStaff ? "" : ""}`}>
                              {msg.isRead ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3 text-gray-300" />}
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

        {/* Input Bar */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 shrink-0">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {attachments.map((_, i) => (
                <div key={i} className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                  <Paperclip className="w-3 h-3" />
                  <span>File {i+1}</span>
                  <X className="w-3 h-3 cursor-pointer ml-0.5" onClick={() => setAttachments((p: string[]) => p.filter((_: string, j: number) => j !== i))} />
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:border-blue-300 transition-colors">
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFile} />
            <Paperclip className="w-4.5 h-4.5 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors shrink-0"
              onClick={() => fileInputRef.current?.click()} />
            <input
              className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-gray-400 text-gray-800"
              placeholder="Type your message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }}
            />
            <button type="submit"
              disabled={sendMutation.isPending || isUploading || (!newMessage.trim() && !attachments.length)}
              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors shrink-0">
              {sendMutation.isPending || isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      </div>

      {/* ── RIGHT: Ticket Info ──────────────────────────── */}
      <div className="w-[320px] shrink-0 bg-white overflow-y-auto border-l border-gray-100">
        {/* Ticket Information */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <span className="font-bold text-sm text-gray-900">Ticket Information</span>
          </div>
          <div className="space-y-5">
            <InfoRow label="Ticket ID" value={<span className="font-bold text-gray-900">#{activeTicket.id}</span>} />
            <InfoRow label="Status" value={
              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[11px] font-bold border border-green-100 cursor-pointer hover:bg-green-100 transition-colors">
                Open <ChevronRight className="w-3 h-3 rotate-90" />
              </div>
            } />
            <InfoRow label="Category" value={activeTicket.issueType} />
            <InfoRow label="Priority" value={priorityBadge(activeTicket.priority)} />
            <InfoRow label="Created On" value={fmt(activeTicket.createdAt, "MMM d, yyyy, h:mm a")} />
            <InfoRow label="Assigned To" value={
              <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                  S
                </div>
                <span className="text-[12px] font-bold text-gray-700">{activeTicket.assignedStaff?.name || "STAFF (Admin)"}</span>
              </div>
            } />
          </div>
        </div>

        {/* Attachments Section */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Paperclip className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <span className="font-bold text-sm text-gray-900">Attachments</span>
          </div>
          <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group cursor-pointer hover:border-blue-200 transition-all">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                   <ImgIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[11px] font-bold text-gray-800 truncate">screenshot_issue.png</p>
                   <p className="text-[10px] font-bold text-gray-400">512 KB</p>
                </div>
                <Download className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
             </div>
             <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group cursor-pointer hover:border-blue-200 transition-all">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                   <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[11px] font-bold text-gray-800 truncate">order_details.pdf</p>
                   <p className="text-[10px] font-bold text-gray-400">320 KB</p>
                </div>
                <Download className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
             </div>
          </div>
        </div>

        {/* Status History */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <span className="font-bold text-sm text-gray-900">Status History</span>
          </div>
          <div className="space-y-6 relative ml-2">
            <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-gray-100" />
            <div className="flex gap-4 relative z-10">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm mt-1 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{fmt(activeTicket.createdAt, "MMM d, yyyy, h:mm a")}</p>
                <p className="text-[12px] font-bold text-gray-800 mt-0.5">Ticket created</p>
              </div>
            </div>
            <div className="flex gap-4 relative z-10">
              <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white shadow-sm mt-1 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{fmt(activeTicket.updatedAt, "MMM d, yyyy, h:mm a")}</p>
                <p className="text-[12px] font-bold text-gray-800 mt-0.5">Assigned to STAFF (Admin)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Response Time Box */}
        <div className="p-6">
           <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 border border-blue-50">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-gray-900">Response Time</p>
                <p className="text-[11px] leading-relaxed text-gray-500">
                  Our team typically responds within <span className="text-blue-600 font-bold">2-4 business hours.</span>
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-2">
    <span className="text-[11px] text-gray-400 shrink-0">{label}</span>
    <div className="text-[12px] text-gray-700 font-medium text-right">{value}</div>
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
              {["General Inquiry","Payment Issue","Invoice Issue","Booking Issue","Part Request","Complaint","Technical Issue"].map(t => (
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
              {["Low","Medium","High","Urgent"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
