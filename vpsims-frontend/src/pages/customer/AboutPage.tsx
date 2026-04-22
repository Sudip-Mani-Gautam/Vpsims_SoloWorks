import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock, Navigation, Map as MapIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

const customMarkerIcon = new L.DivIcon({
  html: `<div style="background-color: hsl(var(--primary)); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0px 4px 6px rgba(0,0,0,0.3);"></div>`,
  className: 'custom-map-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

const mockBranches = [
  { id: 1, name: "Kathmandu Central Hub", address: "Kantipath, Kathmandu", phone: "+977-1-4234567", open: "9:00 AM - 6:00 PM", lat: 27.7172, lng: 85.3240 },
  { id: 2, name: "Pokhara Regional Branch", address: "Lakeside, Pokhara", phone: "+977-61-456789", open: "9:00 AM - 5:00 PM", lat: 28.2096, lng: 83.9856 },
  { id: 3, name: "Biratnagar Distribution", address: "Traffic Chowk, Biratnagar", phone: "+977-21-567890", open: "10:00 AM - 6:00 PM", lat: 26.4525, lng: 87.2718 },
  { id: 4, name: "Lalitpur Service Center", address: "Jawalakhel, Lalitpur", phone: "+977-1-5534567", open: "8:00 AM - 8:00 PM", lat: 27.6644, lng: 85.3188 },
];

const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

const AboutPage = () => {
  const [search, setSearch] = useState("");
  const [activeCenter, setActiveCenter] = useState<[number, number]>([27.7, 85.3]);
  const [activeZoom, setActiveZoom] = useState(7);

  const filteredBranches = mockBranches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.address.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (search.trim() !== "" && filteredBranches.length > 0) {
      // Pinpoint to the first matched result with a closer zoom
      setActiveCenter([filteredBranches[0].lat, filteredBranches[0].lng]);
      setActiveZoom(13);
    } else if (search.trim() === "") {
      // Reset view
      setActiveCenter([27.7, 85.3]);
      setActiveZoom(7);
    }
  }, [search]); // Intentionally don't include filteredBranches as a dependency to avoid infinite loop references

  const handleBranchClick = (lat: number, lng: number) => {
    setActiveCenter([lat, lng]);
    setActiveZoom(15);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-foreground tracking-tight flex items-center gap-2">
            <MapIcon className="w-8 h-8 text-primary" /> Branch Locator & Map
          </h1>
          <p className="text-muted-foreground font-medium text-lg mt-1">Find your nearest VPSIMS Pro center and access quick service options.</p>
        </div>
      </div>

      {/* Real-Time Search Filter Section */}
      <Card className="glass-card border-primary/20 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="relative max-w-2xl w-full mx-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
            <Input 
              className="pl-12 h-14 bg-background border-2 border-border/50 focus:border-primary text-lg transition-all duration-300 rounded-xl shadow-inner"
              placeholder="Search branches by city, street, or hub name to pinpoint location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredBranches.length > 0 ? (
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                 {filteredBranches.length} Found
               </div>
            ) : (
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-destructive px-3 py-1 bg-destructive/10 rounded-full">
                 0 Found
               </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map & Branches Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card shadow-xl border-border/40 overflow-hidden h-[600px] flex flex-col relative group">
            <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md px-4 py-2 rounded-xl border border-border shadow-sm flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
               <span className="text-sm text-foreground font-bold tracking-tight">Live Pinpoint Tracking</span>
            </div>
            
            <div className="w-full h-full z-0 overflow-hidden relative">
              <MapContainer center={activeCenter} zoom={activeZoom} scrollWheelZoom={true} className="w-full h-full z-0">
                <MapController center={activeCenter} zoom={activeZoom} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="filter mix-blend-multiply opacity-90 transition-all duration-700 dark:invert-[0.9] dark:hue-rotate-180 dark:mix-blend-normal"
                />
                {filteredBranches.map(branch => (
                  <Marker key={branch.id} position={[branch.lat, branch.lng]} icon={customMarkerIcon}>
                    <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
                      <div className="flex flex-col gap-1 w-full m-0 p-1">
                        <strong className="text-[13px] font-black text-slate-900 leading-tight">{branch.name}</strong>
                        <span className="text-[11px] text-slate-500 font-medium">{branch.address}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredBranches.map((branch) => (
            <Card 
              key={branch.id} 
              onClick={() => handleBranchClick(branch.lat, branch.lng)}
              className="glass-card border-border/40 hover:border-primary hover:shadow-md transition-all shadow-sm group cursor-pointer"
            >
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg group-hover:text-primary transition-colors flex justify-between items-start gap-2">
                  <span>{branch.name}</span>
                  <div className="w-8 h-8 rounded-full bg-primary/5 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Navigation className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-foreground leading-relaxed pt-1">{branch.address}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium pt-1 hover:text-primary transition-colors">{branch.phone}</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-muted-foreground pt-1">{branch.open}</div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredBranches.length === 0 && (
             <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center animate-in fade-in zoom-in">
               <MapPin className="w-12 h-12 mb-3 text-muted" />
               <p className="font-bold">No branches found.</p>
               <p className="text-sm">Try adjusting your search query.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
