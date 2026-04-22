import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, User, Phone, Hash, Car } from "lucide-react";

const customers = [
  { id: "C001", name: "Bikash Rai", phone: "9801111111", vehicleNo: "BA-1-KHA-1234", vehicleModel: "Toyota Corolla 2020", email: "bikash@email.com", purchases: 8, totalSpent: 1250 },
  { id: "C002", name: "Anita Gurung", phone: "9802222222", vehicleNo: "BA-2-KA-5678", vehicleModel: "Honda Civic 2019", email: "anita@email.com", purchases: 15, totalSpent: 5800 },
  { id: "C003", name: "Prabin KC", phone: "9803333333", vehicleNo: "BA-1-JA-9012", vehicleModel: "Suzuki Swift 2021", email: "prabin@email.com", purchases: 3, totalSpent: 320 },
];

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("name");

  const filtered = customers.filter(c => {
    const val = query.toLowerCase();
    if (searchBy === "name") return c.name.toLowerCase().includes(val);
    if (searchBy === "phone") return c.phone.includes(val);
    if (searchBy === "id") return c.id.toLowerCase().includes(val);
    if (searchBy === "vehicle") return c.vehicleNo.toLowerCase().includes(val);
    return false;
  });

  const icons = { name: <User className="w-4 h-4" />, phone: <Phone className="w-4 h-4" />, id: <Hash className="w-4 h-4" />, vehicle: <Car className="w-4 h-4" /> };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Customer Search</h1>
        <p className="text-muted-foreground">Find customers by name, phone, ID, or vehicle number</p>
      </div>
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Select value={searchBy} onValueChange={setSearchBy}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="glass-card hover-lift">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">{c.name[0]}</div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-foreground">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.id}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3 h-3" />{c.phone}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Car className="w-3 h-3" />{c.vehicleModel} ({c.vehicleNo})</div>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm">
                <span className="text-muted-foreground">{c.purchases} purchases</span>
                <span className="font-medium text-foreground">${c.totalSpent.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
