import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Loader2, MessageCircle, ChevronDown, Search, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  hexColor?: string;
}

const COLOR_MAP: Record<string, string> = {
  "white": "hsl(var(--card))",
  "blue": "hsl(217 91% 60% / 0.1)",
  "green": "hsl(142 71% 45% / 0.1)",
  "yellow": "hsl(38 92% 50% / 0.1)",
  "red": "hsl(0 72% 51% / 0.1)",
  "purple": "hsl(262 83% 58% / 0.1)",
  "gray": "hsl(var(--muted))"
};

const ACCENT_MAP: Record<string, string> = {
  "white": "hsl(var(--border))",
  "blue": "hsl(217 91% 60%)",
  "green": "hsl(142 71% 45%)",
  "yellow": "hsl(38 92% 50%)",
  "red": "hsl(0 72% 51%)",
  "purple": "hsl(262 83% 58%)",
  "gray": "hsl(215 16% 47%)"
};

const FAQPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: faqs = [], isLoading } = useQuery<FAQ[]>({
    queryKey: ["faqs-published"],
    queryFn: async () => {
      const { data } = await api.get("/faq");
      return data;
    },
  });

  const categories = ["All", ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFaqs = faqs.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(search.toLowerCase()) || 
                         f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getRowBg = (colorName?: string) => {
    if (!colorName) return COLOR_MAP["white"];
    const key = colorName.toLowerCase();
    return COLOR_MAP[key] || COLOR_MAP["white"];
  };

  const getAccentColor = (colorName?: string) => {
    if (!colorName) return ACCENT_MAP["blue"];
    const key = colorName.toLowerCase();
    return ACCENT_MAP[key] || ACCENT_MAP["blue"];
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-8 min-h-screen bg-background text-foreground">
      {/* Compact Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black text-foreground tracking-tight">Knowledge Base</h1>
            <p className="text-muted-foreground text-sm font-medium">Find instant answers to your questions.</p>
          </div>
        </div>

        {/* Compact Search Bar */}
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search help articles..." 
            className="h-11 pl-11 pr-4 rounded-xl border-input bg-card shadow-sm text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pt-4">
        {/* Sidebar Navigation */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-3 mb-3">Filter by Topic</h3>
            <div className="flex flex-col gap-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                    activeCategory === cat 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat}
                  <ArrowRight className={cn("w-3 h-3 transition-transform", activeCategory === cat ? "translate-x-0" : "-translate-x-2 opacity-0")} />
                </button>
              ))}
            </div>
          </div>

          <Card className="bg-muted/50 rounded-[24px] border border-border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Still stuck?</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">Open a support ticket and our team will get back to you.</p>
              </div>
              <button 
                onClick={() => navigate("/customer/support")}
                className="w-full py-2.5 bg-card border border-border text-foreground rounded-lg text-[11px] font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
              >
                Contact Support
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Main FAQ Content */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
              <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Loading...</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-[24px] border border-dashed border-border">
              <p className="text-muted-foreground text-sm font-bold">No results found.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredFaqs.map((faq) => (
                <AccordionItem 
                  key={faq.id} 
                  value={`item-${faq.id}`}
                  style={{ backgroundColor: getRowBg(faq.hexColor) }}
                  className="bg-card border border-border rounded-[20px] shadow-sm hover:border-primary/30 transition-all px-1"
                >
                  <AccordionTrigger className="px-5 py-5 hover:no-underline group">
                    <div className="flex items-center gap-4 text-left">
                      <div 
                        className="w-1 h-6 rounded-full" 
                        style={{ backgroundColor: getAccentColor(faq.hexColor) }}
                      />
                      <span className="font-bold text-base text-foreground group-data-[state=open]:text-primary transition-colors">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-6 pt-1">
                    <div className="pl-5 pr-2 border-l border-border/50 ml-0.5">
                      <div className="text-sm text-muted-foreground font-medium leading-relaxed">
                        {faq.answer}
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-md text-[9px] font-bold uppercase tracking-widest border border-border">
                          {faq.category}
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
