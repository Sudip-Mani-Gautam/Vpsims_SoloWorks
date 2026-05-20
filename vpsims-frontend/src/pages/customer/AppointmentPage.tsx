import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar, CheckCircle, Clock, ChevronLeft, ChevronRight, Car, Zap, Info, Users,
  Wrench, Disc3, Gauge, BatteryCharging, Cpu, CircleDot, Settings, Wind,
  Cable, ShieldCheck, Thermometer, Droplets
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const TIME_SLOTS = [
  "9:00–10:00", "10:00–11:00", "11:00–12:00", "12:00–1:00",
  "1:00–2:00",  "2:00–3:00",   "3:00–4:00",   "4:00–5:00",
];
const MAX_PER_SLOT = 5;

// Remove dummy data

const DAYS    = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SERVICES: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: "general",      label: "General Service",        icon: Wrench },
  { value: "maintenance",  label: "Scheduled Maintenance",  icon: Settings },
  { value: "brake",        label: "Brake Inspection",       icon: Disc3 },
  { value: "oil",          label: "Oil Change",             icon: Droplets },
  { value: "tire",         label: "Tire Replacement",       icon: CircleDot },
  { value: "alignment",    label: "Wheel Alignment",        icon: Gauge },
  { value: "battery",      label: "Battery Service",        icon: BatteryCharging },
  { value: "engine",       label: "Engine Diagnostics",     icon: Cpu },
  { value: "transmission", label: "Transmission Service",   icon: Settings },
  { value: "ac",           label: "AC & Heating Service",   icon: Thermometer },
  { value: "electrical",   label: "Electrical Check",       icon: Cable },
  { value: "suspension",   label: "Suspension Inspection",  icon: ShieldCheck },
  { value: "leak",         label: "Fluid Leak Inspection",  icon: Droplets },
  { value: "pretrip",      label: "Pre-Trip Inspection",    icon: Wind },
];

const getServiceName = (serviceNotes?: string) => {
  if (!serviceNotes) return "General Service";
  const serviceLine = serviceNotes.split("\n").find(line => line.startsWith("Service:"));
  return serviceLine?.replace("Service:", "").trim() || serviceNotes.split("\n")[0] || "General Service";
};

const AppointmentPage = () => {
  const today = new Date();
  const [booked, setBooked]                   = useState(false);
  const [selectedDate, setSelectedDate]       = useState("");
  const [selectedSlot, setSelectedSlot]       = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [notes, setNotes]                     = useState("");
  const [calMonth, setCalMonth]               = useState(today.getMonth());
  const [calYear, setCalYear]                 = useState(today.getFullYear());

  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ["my-vehicles"],
    queryFn: async () => { const res = await api.get("/vehicle"); return res.data; },
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => { const res = await api.get("/branch"); return res.data; },
  });

  const { data: myBookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => { const res = await api.get("/booking"); return res.data; },
  });

  const firstDay     = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth  = new Date(calYear, calMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const formatDate = (day: number) => `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const isPast     = (day: number) => new Date(formatDate(day)) < new Date(new Date().toDateString());

  const slotAvailability = useMemo(() => {
    if (!selectedDate) return [];
    // Currently relying on backend for exact availability per slot would require many calls.
    // For now we allow selection and backend will validate if full.
    return TIME_SLOTS.map(slot => ({
      slot,
      booked: 0,
      remaining: MAX_PER_SLOT,
      full: false,
    }));
  }, [selectedDate]);

  const canBook = selectedDate && selectedSlot && selectedService && selectedVehicleId;

  const handleBook = async () => { 
    if (!canBook) return;
    try {
      const branchId = branches && branches.length > 0 ? branches[0].id : 1;
      const selectedServiceName = SERVICES.find(s => s.value === selectedService)?.label || selectedService;
      await api.post("/booking", {
        branchId: branchId,
        vehicleId: parseInt(selectedVehicleId),
        serviceDate: selectedDate,
        timeSlot: selectedSlot,
        serviceNotes: notes.trim()
          ? `Service: ${selectedServiceName}\nNotes: ${notes.trim()}`
          : `Service: ${selectedServiceName}`
      });
      setBooked(true);
      refetchBookings();
    } catch (err: any) {
      console.error(err);
      alert("Failed to book appointment: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Book Appointment</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Schedule a service appointment — select a date and available time slot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Main Booking Area ── */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="border-border">
            <CardHeader className="border-b border-border py-4 px-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar size={16} />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">New Appointment</CardTitle>
                  <p className="text-[10px] text-muted-foreground font-medium">All fields are required to confirm</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {booked ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center gap-5"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle size={30} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">Appointment Confirmed!</h3>
                      <p className="text-sm text-muted-foreground mt-1">Pending staff approval. You'll be notified shortly.</p>
                      <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border text-sm font-semibold text-foreground">
                        <Calendar size={14} className="text-primary" />
                        {selectedDate} · {selectedSlot}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-semibold"
                      onClick={() => { setBooked(false); setSelectedSlot(""); setSelectedDate(""); setSelectedService(""); setSelectedVehicleId(""); setNotes(""); }}
                    >
                      Book Another Appointment
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Service + Vehicle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Service Type</Label>
                        <Select value={selectedService} onValueChange={setSelectedService}>
                          <SelectTrigger className="h-10 border-border text-sm">
                            <SelectValue placeholder="Select a service..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border shadow-xl">
                            {SERVICES.map(s => {
                              const Icon = s.icon;
                              return (
                                <SelectItem key={s.value} value={s.value} className="text-sm">
                                  <div className="flex items-center gap-2">
                                    <Icon size={14} className="text-muted-foreground" />
                                    <span>{s.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Vehicle</Label>
                        <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                          <SelectTrigger className="h-10 border-border text-sm">
                            <SelectValue placeholder={loadingVehicles ? "Loading..." : "Choose vehicle..."} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border shadow-xl">
                            {vehicles?.map((v: any) => (
                              <SelectItem key={v.id} value={v.id.toString()} className="text-sm">
                                <div className="flex items-center gap-2">
                                  <Car size={13} className="text-muted-foreground" />
                                  {v.make} {v.model} · {v.licensePlate}
                                </div>
                              </SelectItem>
                            ))}
                            {vehicles?.length === 0 && (
                              <div className="p-3 text-xs text-muted-foreground text-center">No vehicles registered</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Calendar + Slots */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Calendar */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Select Date</Label>
                        <div className="border border-border rounded-xl bg-card p-4">
                          <div className="flex items-center justify-between mb-4">
                            <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                              <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-bold text-foreground">{MONTHS[calMonth]} {calYear}</span>
                            <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                              <ChevronRight size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-7 mb-2">
                            {DAYS.map(d => (
                              <div key={d} className="text-center text-[10px] font-bold text-muted-foreground/60 py-1">{d}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-0.5">
                            {cells.map((day, i) => {
                              if (!day) return <div key={`e${i}`} />;
                              const dateStr   = formatDate(day);
                              const past      = isPast(day);
                              const isSelected = dateStr === selectedDate;
                              const isToday   = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                              return (
                                <button
                                  key={dateStr}
                                  disabled={past}
                                  onClick={() => { setSelectedDate(dateStr); setSelectedSlot(""); }}
                                  className={cn(
                                    "w-full aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center",
                                    past        && "text-muted-foreground/25 cursor-not-allowed",
                                    !past && isSelected  && "bg-primary text-white shadow-md",
                                    !past && !isSelected && isToday && "ring-2 ring-primary text-primary font-bold",
                                    !past && !isSelected && !isToday && "hover:bg-muted text-foreground"
                                  )}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                          {selectedDate && (
                            <div className="mt-3 pt-3 border-t border-border/50 text-center text-[11px] font-semibold text-primary">
                              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Available Time Slots</Label>
                        {!selectedDate ? (
                          <div className="h-full min-h-[260px] border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center p-6 bg-muted/10">
                            <Clock size={28} className="text-muted-foreground/25 mb-3" />
                            <p className="text-xs text-muted-foreground font-medium">Select a date to view available slots</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto pr-1">
                            {slotAvailability.map(({ slot, remaining, full }) => (
                              <button
                                key={slot}
                                disabled={full}
                                onClick={() => setSelectedSlot(slot)}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                                  full         && "bg-muted/30 border-border text-muted-foreground/40 cursor-not-allowed",
                                  !full && selectedSlot === slot && "bg-primary border-primary text-white shadow-md shadow-primary/20",
                                  !full && selectedSlot !== slot && "bg-card border-border hover:border-primary/40 hover:bg-muted/40"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                                    full ? "bg-muted text-muted-foreground" :
                                    selectedSlot === slot ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                                  )}>
                                    <Clock size={13} />
                                  </div>
                                  <span className="text-sm font-semibold">{slot}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users size={11} className={cn(
                                    full ? "text-muted-foreground/40" :
                                    selectedSlot === slot ? "text-white/70" : "text-muted-foreground/60"
                                  )} />
                                  <span className={cn(
                                    "text-[10px] font-semibold",
                                    full ? "text-muted-foreground/40" :
                                    selectedSlot === slot ? "text-white/80" :
                                    remaining <= 2 ? "text-amber-600" : "text-emerald-600"
                                  )}>
                                    {full ? "Full" : `${remaining} left`}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        Notes <span className="font-normal opacity-60">(optional)</span>
                      </Label>
                      <Textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Describe any issues or special requirements..."
                        className="resize-none border-border text-sm min-h-[72px]"
                        rows={2}
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      onClick={handleBook}
                      disabled={!canBook}
                      className="w-full h-11 font-semibold text-sm shadow-lg shadow-primary/20 transition-all"
                    >
                      <Zap size={15} className="mr-2 fill-current" />
                      Confirm Appointment
                    </Button>

                    {!canBook && (
                      <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
                        <Info size={11} /> Select a service, vehicle, date, and time slot to continue
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-4 space-y-5">
          {/* My Appointments */}
          <Card className="border-border">
            <CardHeader className="border-b border-border py-4 px-5">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                <CardTitle className="text-sm font-bold">Your Appointments</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {myBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-5">
                  <Calendar size={28} className="text-muted-foreground/20 mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">No appointments yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {myBookings.map((apt: any) => {
                    const serviceName = getServiceName(apt.serviceNotes);
                    return (
                    <div key={apt.id} className="px-5 py-3.5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-tight">{serviceName}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock size={11} className="text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground font-medium">{new Date(apt.serviceDate).toLocaleDateString()} · {apt.timeSlot}</span>
                          </div>
                        </div>
                        <Badge className={cn(
                          "text-[10px] font-bold px-2 py-0.5 border rounded-md flex-shrink-0",
                          apt.status === "Approved" || apt.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Info */}
          <Card className="border-border overflow-hidden">
            <div className="bg-primary/5 border-b border-border px-5 py-3.5">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Info size={14} className="text-primary" /> Booking Guidelines
              </h3>
            </div>
            <CardContent className="p-5">
              <ul className="space-y-3">
                {[
                  { label: "Session Duration",  value: "1 hour per slot" },
                  { label: "Working Hours",     value: "9:00 AM – 5:00 PM" },
                  { label: "Capacity",          value: `${MAX_PER_SLOT} vehicles / slot` },
                  { label: "Approval",          value: "Required by staff" },
                  { label: "Sync",              value: "Real-time availability" },
                ].map(({ label, value }) => (
                  <li key={label} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-semibold text-foreground text-right">{value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
