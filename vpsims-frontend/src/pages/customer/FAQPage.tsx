import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HelpCircle, Loader2, MessageCircle, Search, ArrowRight,
  BookOpen, ChevronDown, Tag
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  hexColor?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Rewards:  { bg: "bg-amber-500/10",   text: "text-amber-600",   dot: "bg-amber-500"   },
  Bookings: { bg: "bg-blue-500/10",    text: "text-blue-600",    dot: "bg-blue-500"    },
  Parts:    { bg: "bg-violet-500/10",  text: "text-violet-600",  dot: "bg-violet-500"  },
  Policies: { bg: "bg-rose-500/10",    text: "text-rose-600",    dot: "bg-rose-500"    },
  Default:  { bg: "bg-primary/10",     text: "text-primary",     dot: "bg-primary"     },
};

const getCatStyle = (cat: string) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.Default;

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
    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const countByCategory = (cat: string) =>
    cat === "All" ? faqs.length : faqs.filter(f => f.category === cat).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Find instant answers to your questions</p>
        </div>
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            className="h-10 pl-9 text-sm border-border bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {filteredFaqs.length}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Category Filter */}
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 mb-2">Filter by Topic</p>
            {categories.map(cat => {
              const style = getCatStyle(cat);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {cat !== "All" && (
                      <span className={cn("w-2 h-2 rounded-full", isActive ? "bg-white/60" : style.dot)} />
                    )}
                    {cat}
                  </span>
                  <span className={cn(
                    "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {countByCategory(cat)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Contact Card */}
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Still stuck?</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Our support team is ready to help you.</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs font-semibold h-8 gap-1.5"
                onClick={() => navigate("/customer/support")}
              >
                <MessageCircle size={12} /> Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── FAQ Content ── */}
        <div className="lg:col-span-3 space-y-3">
          {/* Result count */}
          {!isLoading && (
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground font-medium">
                {filteredFaqs.length === 0
                  ? "No articles found"
                  : `${filteredFaqs.length} article${filteredFaqs.length !== 1 ? "s" : ""}`}
                {activeCategory !== "All" && <span className="ml-1">in <strong>{activeCategory}</strong></span>}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
              <p className="text-xs text-muted-foreground">Loading articles...</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-foreground">No results found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different search term or category</p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-3 text-xs text-primary font-semibold hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <motion.div layout>
              <Accordion type="single" collapsible className="space-y-2">
                <AnimatePresence>
                  {filteredFaqs.map((faq, idx) => {
                    const style = getCatStyle(faq.category);
                    return (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <AccordionItem
                          value={`item-${faq.id}`}
                          className="bg-card border border-border rounded-xl shadow-sm hover:border-primary/30 hover:shadow-md transition-all overflow-hidden"
                        >
                          <AccordionTrigger className="px-5 py-4 hover:no-underline group [&>svg]:hidden">
                            <div className="flex items-center gap-3 text-left w-full">
                              <div className={cn("w-1 h-5 rounded-full flex-shrink-0", style.dot)} />
                              <span className="font-semibold text-sm text-foreground group-data-[state=open]:text-primary transition-colors flex-1">
                                {faq.question}
                              </span>
                              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-5 pb-5 pt-0">
                            <div className="pl-4 border-l-2 border-border ml-0.5 space-y-3">
                              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                              <div className="flex items-center gap-2">
                                <Tag size={11} className="text-muted-foreground/50" />
                                <span className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                  style.bg, style.text
                                )}>
                                  {faq.category}
                                </span>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </Accordion>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
