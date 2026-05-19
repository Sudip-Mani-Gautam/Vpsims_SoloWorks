import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, User, Phone, Hash, Car, Mail, Trophy, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Vehicle {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  loyaltyPoints: number;
  vehicles?: Vehicle[];
}

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("name");

  // Fetch real customers from database
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["search-customers"],
    queryFn: async () => {
      const { data } = await api.get("/user");
      return data.filter((u: any) => u.role?.toLowerCase() === "customer");
    }
  });

  const filtered = customers.filter(c => {
    const val = query.toLowerCase();
    if (!val) return true; // Show all by default
    if (searchBy === "name") return c.name.toLowerCase().includes(val);
    if (searchBy === "phone") return (c.phone || "").includes(val);
    if (searchBy === "id") return `C-${c.id.toString().padStart(4, "0")}`.toLowerCase().includes(val) || String(c.id).includes(val);
    if (searchBy === "vehicle") return c.vehicles?.some(v => v.licensePlate.toLowerCase().includes(val));
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/staff"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-foreground">Customer Search</h1>
          <p className="text-muted-foreground">Find customers by name, phone, ID, or vehicle number</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={searchBy} onValueChange={setSearchBy}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="name">By Name</SelectItem>
                <SelectItem value="phone">By Phone</SelectItem>
                <SelectItem value="id">By ID</SelectItem>
                <SelectItem value="vehicle">By Vehicle No.</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" placeholder={`Search by ${searchBy}...`} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground italic font-semibold">
          No matching customers found in registry.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link key={c.id} to={`/staff/customers/${c.id}`}>
              <Card className="glass-card hover-lift h-full flex flex-col justify-between">
                <CardContent className="pt-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                        {c.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-black text-foreground truncate">{c.name}</h3>
                        <p className="text-xs text-muted-foreground font-semibold">C-{c.id.toString().padStart(4, "0")}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground truncate">
                        <Mail className="w-3.5 h-3.5" />
                        {c.email}
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          {c.phone}
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Car className="w-3.5 h-3.5 mt-0.5" />
                        <div className="flex-1 text-xs">
                          {c.vehicles && c.vehicles.length > 0 ? (
                            c.vehicles.map((v, idx) => (
                              <div key={idx} className="font-bold text-foreground">
                                {v.make} {v.model} ({v.licensePlate})
                              </div>
                            ))
                          ) : (
                            <span className="italic text-muted-foreground/60">No vehicle registered</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      Loyalty Points
                    </span>
                    <span className="font-black text-foreground">{c.loyaltyPoints} PTS</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
