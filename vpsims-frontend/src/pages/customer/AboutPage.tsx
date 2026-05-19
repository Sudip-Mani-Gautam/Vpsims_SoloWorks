import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, Phone, Clock, Navigation, Search, Map as MapIcon,
  CheckCircle2, Building2, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const customMarkerIcon = new L.DivIcon({
  html: `<div style="background:hsl(221,83%,53%);width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
  className: "custom-map-marker",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -12],
});

const mockBranches = [
  { id: 1, name: "Kathmandu Central Hub", address: "Kantipath, Kathmandu", phone: "+977-1-4234567", open: "9:00 AM – 6:00 PM", lat: 27.7172, lng: 85.324, status: "Open" },
  { id: 2, name: "Pokhara Regional Branch", address: "Lakeside, Pokhara", phone: "+977-61-456789", open: "9:00 AM – 5:00 PM", lat: 28.2096, lng: 83.9856, status: "Open" },
  { id: 3, name: "Biratnagar Distribution", address: "Traffic Chowk, Biratnagar", phone: "+977-21-567890", open: "10:00 AM – 6:00 PM", lat: 26.4525, lng: 87.2718, status: "Closed" },
  { id: 4, name: "Lalitpur Service Center", address: "Jawalakhel, Lalitpur", phone: "+977-1-5534567", open: "8:00 AM – 8:00 PM", lat: 27.6644, lng: 85.3188, status: "Open" },
];

const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.5 }); }, [center, zoom, map]);
  return null;
};

const AboutPage = () => {
  const [search, setSearch] = useState("");
  const [activeCenter, setActiveCenter] = useState<[number, number]>([27.7, 85.3]);
  const [activeZoom, setActiveZoom] = useState(7);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredBranches = mockBranches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (search.trim() && filteredBranches.length > 0) {
      setActiveCenter([filteredBranches[0].lat, filteredBranches[0].lng]);
      setActiveZoom(13);
    } else if (!search.trim()) {
      setActiveCenter([27.7, 85.3]);
      setActiveZoom(7);
      setSelectedId(null);
    }
  }, [search]);

  const handleBranchClick = (branch: typeof mockBranches[0]) => {
    setActiveCenter([branch.lat, branch.lng]);
    setActiveZoom(15);
    setSelectedId(branch.id);
  };

  const openCount = mockBranches.filter(b => b.status === "Open").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-primary" /> Branch Locator
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Find your nearest VPSIMS service center</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 size={13} /> {openCount} branches open now
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground text-xs font-semibold">
            <Building2 size={13} /> {mockBranches.length} total locations
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9 h-10 text-sm border-border bg-background"
          placeholder="Search by city, branch name, or street..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <span className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full",
            filteredBranches.length > 0
              ? "bg-primary/10 text-primary"
              : "bg-red-500/10 text-red-600"
          )}>
            {filteredBranches.length} found
          </span>
        )}
      </div>

      {/* ── Map + Branch Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="border-border overflow-hidden h-[540px] relative">
            <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur px-3 py-1.5 rounded-lg border border-border shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-foreground">Live Tracking</span>
            </div>
            <MapContainer center={activeCenter} zoom={activeZoom} scrollWheelZoom className="w-full h-full z-0">
              <MapController center={activeCenter} zoom={activeZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="dark:invert dark:hue-rotate-180 dark:brightness-[0.85] dark:contrast-[1.05]"
              />
              {filteredBranches.map((branch) => (
                <Marker key={branch.id} position={[branch.lat, branch.lng]} icon={customMarkerIcon}>
                  <Popup className="rounded-xl overflow-hidden shadow-xl">
                    <div className="p-1 space-y-0.5">
                      <p className="text-[13px] font-bold text-slate-900">{branch.name}</p>
                      <p className="text-[11px] text-slate-500">{branch.address}</p>
                      <p className="text-[11px] text-blue-600 font-medium">{branch.phone}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </div>

        {/* Branch List */}
        <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
          <AnimatePresence>
            {filteredBranches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl"
              >
                <MapPin className="w-10 h-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-semibold text-foreground">No branches found</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
              </motion.div>
            ) : (
              filteredBranches.map((branch, idx) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    onClick={() => handleBranchClick(branch)}
                    className={cn(
                      "border cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedId === branch.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Branch Name + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn("text-sm font-bold leading-tight", selectedId === branch.id ? "text-primary" : "text-foreground")}>
                            {branch.name}
                          </p>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                          branch.status === "Open"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-red-500/10 text-red-600"
                        )}>
                          {branch.status}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin size={12} className="text-primary flex-shrink-0" />
                          {branch.address}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone size={12} className="flex-shrink-0" />
                          {branch.phone}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock size={12} className="flex-shrink-0" />
                          {branch.open}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1 border-t border-border">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] gap-1 text-primary hover:bg-primary/10 px-2 font-semibold"
                          onClick={(e) => { e.stopPropagation(); handleBranchClick(branch); }}
                        >
                          <Navigation size={11} /> Navigate
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${branch.phone}`);
                          }}
                        >
                          <ExternalLink size={11} /> Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
