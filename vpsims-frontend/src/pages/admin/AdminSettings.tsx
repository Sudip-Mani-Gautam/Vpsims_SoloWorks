import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Store, Bell, CreditCard, Shield, Save, Sun, Moon, Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

const AdminSettings = () => {
  const { theme, toggleTheme } = useTheme();

  const [storeInfo, setStoreInfo] = useState({
    name: "VPSIMS Nepal",
    address: "Kathmandu, Nepal",
    phone: "01-4567890",
    email: "info@vpsims.np",
    taxRate: "13",
  });

  const [notifications, setNotifications] = useState({
    lowStockAlert: true,
    lowStockThreshold: "10",
    creditReminder: true,
    creditOverdueDays: "30",
    emailInvoices: true,
    dailyReport: false,
  });

  const [loyalty, setLoyalty] = useState({
    enabled: true,
    minSpend: "5000",
    discountPercent: "10",
  });

  const handleSave = () => toast.success("Settings saved successfully!");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Configure store information, notifications, and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Appearance ── */}
        <Card className="card-standard lg:col-span-2">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-subheading flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">Theme Mode</p>
                <p className="text-caption mt-0.5">Switch between light and dark interface</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Sun className="w-4 h-4" /> Light
                </span>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    theme === "dark" ? "bg-primary" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      theme === "dark" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Moon className="w-4 h-4" /> Dark
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Store Information ── */}
        <Card className="card-standard">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-subheading flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-label">Store Name</Label>
              <Input value={storeInfo.name} onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-label">Address</Label>
              <Input value={storeInfo.address} onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-label">Phone</Label>
                <Input value={storeInfo.phone} onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-label">Email</Label>
                <Input value={storeInfo.email} onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-label">Tax Rate (%)</Label>
              <Input type="number" value={storeInfo.taxRate} onChange={(e) => setStoreInfo({ ...storeInfo, taxRate: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* ── Notification Settings ── */}
        <Card className="card-standard">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-subheading flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            {[
              { label: "Low Stock Alerts", desc: "Notify when stock falls below threshold", key: "lowStockAlert" },
              { label: "Credit Reminders", desc: "Email customers with overdue credit", key: "creditReminder" },
              { label: "Email Invoices", desc: "Auto-send invoices via email", key: "emailInvoices" },
              { label: "Daily Summary Report", desc: "Receive daily sales summary email", key: "dailyReport" },
            ].map(({ label, desc, key }) => (
              <div key={key} className="flex items-center justify-between py-0.5">
                <div>
                  <p className="text-label">{label}</p>
                  <p className="text-caption mt-0.5">{desc}</p>
                </div>
                <Switch
                  checked={notifications[key as keyof typeof notifications] as boolean}
                  onCheckedChange={(v) => setNotifications({ ...notifications, [key]: v })}
                />
              </div>
            ))}
            {notifications.lowStockAlert && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-label">Low Stock Threshold (units)</Label>
                <Input type="number" value={notifications.lowStockThreshold} onChange={(e) => setNotifications({ ...notifications, lowStockThreshold: e.target.value })} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Loyalty Program ── */}
        <Card className="card-standard">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-subheading flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Loyalty Program
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">Enable Loyalty Discount</p>
                <p className="text-caption mt-0.5">Auto-apply discount for qualifying purchases</p>
              </div>
              <Switch checked={loyalty.enabled} onCheckedChange={(v) => setLoyalty({ ...loyalty, enabled: v })} />
            </div>
            {loyalty.enabled && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-label">Minimum Spend (NPR)</Label>
                  <Input type="number" value={loyalty.minSpend} onChange={(e) => setLoyalty({ ...loyalty, minSpend: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-label">Discount (%)</Label>
                  <Input type="number" value={loyalty.discountPercent} onChange={(e) => setLoyalty({ ...loyalty, discountPercent: e.target.value })} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Security ── */}
        <Card className="card-standard">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-subheading flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-label">Session Timeout</Label>
              <Select defaultValue="30">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-label">Password Policy</Label>
              <Select defaultValue="strong">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (6+ characters)</SelectItem>
                  <SelectItem value="strong">Strong (8+ with special chars)</SelectItem>
                  <SelectItem value="very-strong">Very Strong (12+ mixed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white">
          <Save className="w-4 h-4 mr-2" /> Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
