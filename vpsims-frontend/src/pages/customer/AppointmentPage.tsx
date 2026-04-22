import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle, Clock, ChevronLeft, ChevronRight, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const TIME_SLOTS = [
  "9:00–10:00", "10:00–11:00", "11:00–12:00", "12:00–1:00",
  "1:00–2:00",  "2:00–3:00",   "3:00–4:00",   "4:00–5:00",
];
const MAX_PER_SLOT = 5;

const existingBookings: Record<string, Record<string, number>> = {
  "2026-04-12": { "10:00–11:00": 3, "11:00–12:00": 5, "2:00–3:00": 1 },
  "2026-04-13": { "9:00–10:00": 2, "10:00–11:00": 4 },
  "2026-04-14": { "3:00–4:00": 5, "4:00–5:00": 2 },
};

const myAppointments = [
  { id: 1, service: "General Service Check", date: "2026-04-15", time: "10:00–11:00", status: "Approved" },
  { id: 2, service: "Brake Inspection",       date: "2026-04-22", time: "2:00–3:00",   status: "Pending" },
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const AppointmentPage = () => {
  const today = new Date();
  const [booked, setBooked] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  // Fetch Vehicles
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ["my-vehicles"],
    queryFn: async () => {
      const res = await api.get("/vehicle");
      return res.data;
    },
  });

  // Build calendar grid
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const formatDate = (day: number) => `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const isPast = (day: number) => new Date(formatDate(day)) < new Date(new Date().toDateString());

  const slotAvailability = useMemo(() => {
    if (!selectedDate) return [];
    const db = existingBookings[selectedDate] || {};
    return TIME_SLOTS.map(slot => ({
      slot, booked: db[slot] || 0,
      remaining: MAX_PER_SLOT - (db[slot] || 0),
      full: (db[slot] || 0) >= MAX_PER_SLOT,
    }));
  }, [selectedDate]);

  const handleBook = () => { 
    if (selectedDate && selectedSlot && selectedService && selectedVehicleId) {
      setBooked(true); 
    }
  };

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="page-title">Book Appointment</h1>
        <p className="page-subtitle">Schedule a service appointment with dynamic time slot availability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Booking Form */}
        <Card className="lg:col-span-8 card-standard h-fit">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-subheading">New Appointment</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {booked ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto dark:bg-emerald-950 dark:border-emerald-800">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-subheading">Appointment Booked!</h3>
                <p className="page-subtitle">Your booking is pending staff approval.</p>
                <p className="text-sm font-medium text-foreground">{selectedDate} · {selectedSlot}</p>
                <Button variant="outline" onClick={() => { setBooked(false); setSelectedSlot(""); setSelectedDate(""); setSelectedVehicleId(""); }}>
                  Book Another
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service Type */}
                  <div className="space-y-1.5">
                    <Label className="text-label">Service Type</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger><SelectValue placeholder="Select a service…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Service</SelectItem>
                        <SelectItem value="brake">Brake Inspection</SelectItem>
                        <SelectItem value="oil">Oil Change</SelectItem>
                        <SelectItem value="tire">Tire Replacement</SelectItem>
                        <SelectItem value="engine">Engine Diagnostics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vehicle */}
                  <div className="space-y-1.5">
                    <Label className="text-label">Select Vehicle</Label>
                    <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingVehicles ? "Loading vehicles..." : "Choose vehicle..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles?.map((v: any) => (
                          <SelectItem key={v.id} value={v.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Car className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>{v.make} {v.model} ({v.licensePlate})</span>
                            </div>
                          </SelectItem>
                        ))}
                        {vehicles?.length === 0 && (
                          <div className="p-2 text-xs text-muted-foreground text-center">No vehicles found.</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Custom Calendar */}
                  <div className="space-y-2">
                    <Label className="text-label">1. Select Date</Label>
                    <div className="border border-border rounded-xl bg-muted/20 p-4">
                      {/* Month Nav */}
                      <div className="flex items-center justify-between mb-3">
                        <button onClick={prevMonth} className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">{MONTHS[calMonth]} {calYear}</span>
                        <button onClick={nextMonth} className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Day Headers */}
                      <div className="grid grid-cols-7 mb-1">
                        {DAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>)}
                      </div>
                      {/* Dates */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {cells.map((day, i) => {
                          if (!day) return <div key={`e${i}`} />;
                          const dateStr = formatDate(day);
                          const past = isPast(day);
                          const isSelected = dateStr === selectedDate;
                          const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                          return (
                            <button
                              key={dateStr}
                              disabled={past}
                              onClick={() => { setSelectedDate(dateStr); setSelectedSlot(""); }}
                              className={cn(
                                "w-full aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                                past && "text-muted-foreground/30 cursor-not-allowed",
                                !past && isSelected && "bg-primary text-white shadow-md shadow-primary/20",
                                !past && !isSelected && isToday && "ring-2 ring-primary text-primary font-bold",
                                !past && !isSelected && "hover:bg-muted text-foreground"
                              )}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                      {selectedDate && (
                        <p className="text-center text-[11px] font-semibold text-primary mt-3 pt-3 border-t border-border/50">
                          {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-2">
                    <Label className="text-label">2. Available Slots</Label>
                    {!selectedDate ? (
                      <div className="h-[260px] border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center p-6 bg-muted/5">
                        <Clock className="w-8 h-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground font-medium">Please select a date first to view available time slots.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                        {slotAvailability.map(({ slot, remaining, full }) => (
                          <button
                            key={slot}
                            disabled={full}
                            onClick={() => setSelectedSlot(slot)}
                            className={cn(
                              "p-2.5 rounded-xl border text-sm text-left transition-all relative group",
                              full && "bg-muted border-border text-muted-foreground cursor-not-allowed opacity-50",
                              !full && selectedSlot === slot && "bg-primary border-primary text-white shadow-md shadow-primary/20",
                              !full && selectedSlot !== slot && "bg-background border-border hover:border-primary/40 hover:bg-muted/50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[13px]">{slot}</span>
                              <Clock className={cn("w-3.5 h-3.5", full ? "text-muted-foreground" : selectedSlot === slot ? "text-white/70" : "text-muted-foreground/60")} />
                            </div>
                            <span className={cn("text-[10px] mt-0.5 block font-medium",
                              full ? "text-muted-foreground" :
                              selectedSlot === slot ? "text-white/80" :
                              remaining <= 2 ? "text-amber-600" : "text-emerald-600"
                            )}>
                              {full ? "Fully booked" : `${remaining} slots available`}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label className="text-label">Notes <span className="text-caption font-normal">(optional)</span></Label>
                  <Textarea 
                    placeholder="Describe any issues or special requests…" 
                    className="resize-none bg-muted/10" 
                    rows={2} 
                  />
                </div>

                <Button
                  className="w-full h-11 bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
                  onClick={handleBook}
                  disabled={!selectedDate || !selectedSlot || !selectedService || !selectedVehicleId}
                >
                  <Calendar className="w-4 h-4 mr-2" /> Confirm Appointment
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* My Appointments */}
          <Card className="card-standard">
            <CardHeader className="border-b border-border pb-4 bg-muted/10">
              <CardTitle className="text-subheading flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Your Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {myAppointments.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <Calendar className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground font-medium">No appointments booked yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {myAppointments.map((apt) => (
                    <div key={apt.id} className="px-5 py-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-foreground">{apt.service}</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <p className="text-[11px] font-medium text-muted-foreground">{apt.date} · {apt.time}</p>
                        </div>
                      </div>
                      <Badge className={cn("text-[10px] font-bold h-6",
                        apt.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                      )}>
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rules */}
          <Card className="card-standard overflow-hidden">
            <div className="bg-primary/5 px-5 py-4 border-b border-border">
              <h3 className="text-[13px] font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Booking Rules
              </h3>
            </div>
            <CardContent className="pt-5 pb-6">
              <ul className="space-y-3.5">
                {[
                  ["Time Slot", "1 hour per session"],
                  ["Working Hours", "9:00 AM – 5:00 PM"],
                  ["Capacity", `${MAX_PER_SLOT} vehicles per slot`],
                  ["Approval", "Required by staff"],
                  ["Updates", "Real-time sync"],
                ].map(([label, value]) => (
                  <li key={label} className="flex items-center justify-between gap-4">
                    <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
                    <span className="text-[12px] font-bold text-foreground text-right">{value}</span>
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
