import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Plus, Map as MapIcon, Phone, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customMarkerIcon = new L.DivIcon({
  html: `<div style="background-color: hsl(var(--primary)); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0px 4px 6px rgba(0,0,0,0.3);"></div>`,
  className: 'custom-map-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Mock data
const mockBranches = [
  { id: 1, name: "Kathmandu Central Auto Hub", address: "Kantipath, Kathmandu", phone: "+977-1-4234567", email: "ktm.central@vpsims.com", status: "Active", stockLevel: "Healthy", lat: 27.7172, lng: 85.3240 },
  { id: 2, name: "Pokhara Regional Branch", address: "Lakeside, Pokhara", phone: "+977-61-456789", email: "pokhara@vpsims.com", status: "Active", stockLevel: "Low Stock", lat: 28.2096, lng: 83.9856 },
  { id: 3, name: "Biratnagar Distribution", address: "Traffic Chowk, Biratnagar", phone: "+977-21-567890", email: "biratnagar@vpsims.com", status: "Maintenance", stockLevel: "Critical", lat: 26.4525, lng: 87.2718 },
  { id: 4, name: "Lalitpur Service Center", address: "Jawalakhel, Lalitpur", phone: "+977-1-5534567", email: "jawalakhel@vpsims.com", status: "Active", stockLevel: "Healthy", lat: 27.6644, lng: 85.3188 },
];

const BranchManagement = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  
  const filteredBranches = mockBranches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight flex items-center gap-2">
            <MapIcon className="w-8 h-8 text-primary" /> Branch Control Center
          </h1>
          <p className="text-muted-foreground font-medium">Manage geographic distribution centers and service hubs.</p>
        </div>
        <Button onClick={() => navigate('/admin/branches/new')} className="bg-primary text-white hover:bg-primary/90 font-bold hover-lift shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Establish New Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border/40">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground font-bold text-sm uppercase">Total Branches</span>
              <span className="text-4xl font-black text-foreground">12</span>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-success/30 bg-success/5">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-success font-bold text-sm uppercase">Active Centers</span>
              <span className="text-4xl font-black text-success">10</span>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-warning/30 bg-warning/5">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-warning font-bold text-sm uppercase">Needs Restock</span>
              <span className="text-4xl font-black text-warning">2</span>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-destructive/30 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-destructive font-bold text-sm uppercase">Under Maintenance</span>
              <span className="text-4xl font-black text-destructive">0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md shadow-sm rounded-xl overflow-hidden group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          className="pl-11 h-11 bg-card border-border/50 focus:border-primary transition-all duration-300"
          placeholder="Search branches by name or location..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="glass-card shadow-xl border-border/40 overflow-hidden h-[400px] flex flex-col relative group">
        <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md px-4 py-2 rounded-xl border border-border shadow-sm flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
           <span className="text-sm text-foreground font-bold tracking-tight">Live Region View</span>
        </div>
        <div className="w-full h-full z-0 overflow-hidden relative">
          <MapContainer center={[27.7, 85.3]} zoom={7} scrollWheelZoom={false} className="w-full h-full z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="filter mix-blend-multiply opacity-90 transition-all duration-700 dark:invert-[0.9] dark:hue-rotate-180 dark:mix-blend-normal"
            />
            {mockBranches.map(branch => (
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

      <Card className="glass-card shadow-xl overflow-hidden border-border/40">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase pl-6">Branch Hub</TableHead>
                <TableHead className="font-bold text-xs uppercase">Contact Info</TableHead>
                <TableHead className="font-bold text-xs uppercase text-center">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase text-center">Stock Level</TableHead>
                <TableHead className="font-bold text-xs uppercase text-right pr-6">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map(branch => (
                <TableRow key={branch.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-primary w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{branch.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          {branch.address}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs font-medium flex items-center gap-2"><Phone className="w-3 h-3 text-muted-foreground" /> {branch.phone}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2"><Mail className="w-3 h-3 text-muted-foreground" /> {branch.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2 py-0.5 ${branch.status === 'Active' ? 'border-success text-success bg-success/5' : 'border-warning text-warning bg-warning/5'}`}>
                      {branch.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                      branch.stockLevel === 'Healthy' ? 'border-success text-success bg-success/5' : 
                      branch.stockLevel === 'Low Stock' ? 'border-warning text-warning bg-warning/5' : 
                      'border-destructive text-destructive bg-destructive/5'
                    }`}>
                      {branch.stockLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/branches/${branch.id}`)} className="font-bold text-xs text-primary hover:bg-primary/10">
                      Configure Hub
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BranchManagement;
