"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Clock,
  CheckCircle2,
  Sparkles,
  Award,
  ExternalLink,
  Bell,
  BellCheck,
  Bookmark,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Heart,
  FileText,
  Briefcase
} from "lucide-react";

// Scholarship Category Tabs
const categories = [
  { id: "all", label: "All Scholarships", count: 24 },
  { id: "government", label: "Government Grants", count: 10 },
  { id: "private", label: "Private & Corporate", count: 8 },
  { id: "women", label: "Women in Tech", count: 6 },
  { id: "merit", label: "Merit-Based", count: 12 },
];

// Mock Karnataka & National Scholarships Data
const scholarshipsData = [
  {
    id: "s1",
    title: "SSP Karnataka Post-Matric Scholarship (2025/26)",
    provider: "Government of Karnataka • Department of Technical Education",
    logo: "🏛️",
    type: "government",
    grantAmount: "₹25,000 - ₹50,000 / year",
    annualValue: 35000,
    deadline: "Dec 31, 2025",
    daysLeft: 12,
    isUrgent: true,
    isWomenOnly: false,
    eligibility: {
      category: ["General", "OBC", "SC", "ST", "Minorities"],
      maxIncome: "₹2.5 Lakhs / year",
      minMarks: "60% in PUC / 10+2",
      degree: "1st Year Engineering (VTU & Autonomous)",
    },
    tags: ["State Govt", "Tuition Fee Waiver", "SSP Portal Sync"],
    documentsRequired: ["Income Certificate", "PUC Marks Card", "Aadhaar Card", "College Study Certificate"],
    portalUrl: "https://ssp.postmatric.karnataka.gov.in",
    verifiedBySenior: true,
  },
  {
    id: "s2",
    title: "Pragati Scholarship for Women in Engineering",
    provider: "AICTE • Ministry of Education, Govt of India",
    logo: "👩‍💻",
    type: "women",
    grantAmount: "₹50,000 / year (4 Years)",
    annualValue: 50000,
    deadline: "Jan 15, 2026",
    daysLeft: 27,
    isUrgent: false,
    isWomenOnly: true,
    eligibility: {
      category: ["All Categories"],
      maxIncome: "₹8.0 Lakhs / year",
      minMarks: "Admission in 1st Year B.E/B.Tech",
      degree: "Female Students Only",
    },
    tags: ["Women in Tech", "AICTE Central Grant", "Laptop Allowance Included"],
    documentsRequired: ["Family Income Certificate", "Class 12th Marks Card", "Bank Passbook", "College ID"],
    portalUrl: "https://scholarships.gov.in",
    verifiedBySenior: true,
  },
  {
    id: "s3",
    title: "Reliance Foundation Undergraduate Scholarship",
    provider: "Reliance Foundation",
    logo: "💎",
    type: "private",
    grantAmount: "₹2,000,000 Total (Over 4 Years)",
    annualValue: 50000,
    deadline: "Nov 30, 2025",
    daysLeft: 5,
    isUrgent: true,
    isWomenOnly: false,
    eligibility: {
      category: ["All Categories"],
      maxIncome: "₹15.0 Lakhs / year",
      minMarks: "60%+ in 12th Standard",
      degree: "Full-Time 1st Year B.E/B.Tech",
    },
    tags: ["Corporate Grant", "Merit-cum-Means", "Mentorship Included"],
    documentsRequired: ["Aptitude Test Scorecard", "12th Board Certificate", "Income Proof"],
    portalUrl: "https://scholarships.reliancefoundation.org",
    verifiedBySenior: true,
  },
  {
    id: "s4",
    title: "Sitaram Jindal Foundation Engineering Grant",
    provider: "Sitaram Jindal Foundation • Bengaluru",
    logo: "🌿",
    type: "private",
    grantAmount: "₹18,000 / year",
    annualValue: 18000,
    deadline: "Open All Year",
    daysLeft: 90,
    isUrgent: false,
    isWomenOnly: false,
    eligibility: {
      category: ["General", "OBC", "SC/ST"],
      maxIncome: "₹4.0 Lakhs / year",
      minMarks: "70% for Boys / 65% for Girls",
      degree: "Engineering Undergraduates",
    },
    tags: ["Karnataka Trust", "Need-Based", "Monthly Stipend"],
    documentsRequired: ["Jindal Form Annexure VII", "Semester Marks Cards", "Income Certificate"],
    portalUrl: "https://www.sitaramjindalfoundation.org",
    verifiedBySenior: true,
  },
  {
    id: "s5",
    title: "Infosys STEM Women Fellowship 2026",
    provider: "Infosys Foundation",
    logo: "🏢",
    type: "women",
    grantAmount: "₹1,00,000 / year + SDE Mentorship",
    annualValue: 100000,
    deadline: "Feb 10, 2026",
    daysLeft: 52,
    isUrgent: false,
    isWomenOnly: true,
    eligibility: {
      category: ["CSE / ISE / AI-ML / ECE"],
      maxIncome: "No Upper Limit (Merit Based)",
      minMarks: "8.5+ CGPA or 80%+ in PUC",
      degree: "1st & 2nd Year Women Engineers",
    },
    tags: ["Infosys SDE Track", "Women in Engineering", "Direct Interview Fast-track"],
    documentsRequired: ["Resume", "GitHub / Project Links", "Sem 1 CGPA Card"],
    portalUrl: "https://www.infosys.com/infosys-foundation",
    verifiedBySenior: true,
  },
  {
    id: "s6",
    title: "National Scholarship Portal (NSP) Central Sector Scheme",
    provider: "Ministry of Human Resource Development (MHRD)",
    logo: "🇮🇳",
    type: "government",
    grantAmount: "₹20,000 / year",
    annualValue: 20000,
    deadline: "Dec 15, 2025",
    daysLeft: 8,
    isUrgent: true,
    isWomenOnly: false,
    eligibility: {
      category: ["Top 20th Percentile 12th Board"],
      maxIncome: "₹4.5 Lakhs / year",
      minMarks: "Above 80th Percentile in State Board",
      degree: "Regular Degree Students",
    },
    tags: ["Central Govt", "NSP Portal", "Direct Bank Transfer"],
    documentsRequired: ["NSP Application Form", "12th Board Top 20% Certificate", "Aadhaar Bank Link"],
    portalUrl: "https://scholarships.gov.in",
    verifiedBySenior: true,
  },
];

export default function ScholarshipsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filters State
  const [typeFilter, setTypeFilter] = useState("all"); // all, government, private
  const [womenOnlyFilter, setWomenOnlyFilter] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Application Tracker State
  const [trackedScholarships, setTrackedScholarships] = useState<{ [id: string]: "saved" | "applied" | "review" | "awarded" }>({
    s1: "applied",
    s2: "saved",
  });

  // Reminders State
  const [reminders, setReminders] = useState<string[]>(["s1"]);

  // Toast / Modal State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedDocChecklist, setSelectedDocChecklist] = useState<typeof scholarshipsData[0] | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleReminder = (id: string, title: string) => {
    if (reminders.includes(id)) {
      setReminders(reminders.filter((r) => r !== id));
      showToast(`Reminder removed for ${title}`);
    } else {
      setReminders([...reminders, id]);
      showToast(`🔔 Reminder set! We'll alert you 3 days before deadline for ${title}`);
    }
  };

  const updateTrackStatus = (id: string, status: "saved" | "applied" | "review" | "awarded") => {
    setTrackedScholarships({ ...trackedScholarships, [id]: status });
    showToast(`Status updated to "${status.toUpperCase()}"`);
  };

  // Filter Logic
  const filteredScholarships = scholarshipsData.filter((sch) => {
    // Category Tabs
    if (activeCategory === "government" && sch.type !== "government") return false;
    if (activeCategory === "private" && sch.type !== "private") return false;
    if (activeCategory === "women" && !sch.isWomenOnly) return false;

    // Search Query
    if (
      searchQuery &&
      !sch.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sch.provider.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sch.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }

    // Type Filter
    if (typeFilter !== "all" && sch.type !== typeFilter) return false;

    // Women Only Switch
    if (womenOnlyFilter && !sch.isWomenOnly) return false;

    // Urgent Only
    if (urgentOnly && !sch.isUrgent) return false;

    return true;
  });

  // Tracker Counts
  const trackerCounts = {
    saved: Object.values(trackedScholarships).filter((s) => s === "saved").length,
    applied: Object.values(trackedScholarships).filter((s) => s === "applied").length,
    review: Object.values(trackedScholarships).filter((s) => s === "review").length,
    awarded: Object.values(trackedScholarships).filter((s) => s === "awarded").length,
  };

  return (
    <main className="min-h-screen bg-[#08090e] text-[#f3f4f6] selection:bg-purple-500/30 selection:text-purple-200">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-radial-glow opacity-80" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-xl border border-purple-500/40 bg-[#0f111d] px-4 py-3 text-xs font-semibold text-white shadow-2xl flex items-center gap-2 animate-pulse-glow">
          <Sparkles className="size-4 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#08090e]/80 border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 font-bold text-white shadow-lg shadow-purple-500/25">
              CO
            </Link>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                CampusOS Scholarship Hub
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  Karnataka State & Central
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/opportunities"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 hidden sm:flex"
            >
              <Briefcase className="size-3.5" /> Opportunities
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-gray-200 hover:bg-white/[0.08]"
            >
              Back to Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* HERO & APPLICATION TRACKER SECTION */}
      <section className="relative z-10 pt-8 pb-6 border-b border-white/10 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <GraduationCap className="size-4" />
                Student Financial Security Portal
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Never Miss a State, Central or Corporate Grant.
              </h1>
              <p className="text-sm text-gray-400 max-w-2xl">
                Verified scholarships for VTU & Autonomous engineering students across Karnataka. Filter by income slab, category, gender, and set deadline reminders.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center min-w-[110px]">
                <span className="text-xl font-bold text-white block">₹4.5 Cr+</span>
                <span className="text-[11px] text-emerald-300 block">Total Grant Pool</span>
              </div>
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-center min-w-[110px]">
                <span className="text-xl font-bold text-white block">24 Grants</span>
                <span className="text-[11px] text-purple-300 block">Verified Open</span>
              </div>
            </div>
          </div>

          {/* APPLICATION TRACKER KANBAN WIDGET */}
          <div className="rounded-2xl border border-white/15 bg-black/60 p-4 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="size-4 text-purple-400" />
                My Application Tracker
              </span>
              <span className="text-[11px] text-gray-400">Track application progress</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block">Saved / Interested</span>
                  <strong className="text-white text-lg font-bold">{trackerCounts.saved}</strong>
                </div>
                <Bookmark className="size-5 text-gray-400" />
              </div>

              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 flex items-center justify-between">
                <div>
                  <span className="text-blue-300 block">Applied</span>
                  <strong className="text-white text-lg font-bold">{trackerCounts.applied}</strong>
                </div>
                <CheckCircle2 className="size-5 text-blue-400" />
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center justify-between">
                <div>
                  <span className="text-amber-300 block">Under Review</span>
                  <strong className="text-white text-lg font-bold">{trackerCounts.review}</strong>
                </div>
                <Clock className="size-5 text-amber-400" />
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
                <div>
                  <span className="text-emerald-300 block">Awarded</span>
                  <strong className="text-white text-lg font-bold">{trackerCounts.awarded}</strong>
                </div>
                <Award className="size-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* SEARCH BAR & CATEGORY TABS */}
          <div className="space-y-4 pt-2">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by scholarship title, provider (SSP, NSP, Infosys, Jindal, Reliance)..."
                className="w-full rounded-2xl border border-white/15 bg-black/60 pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/30"
                        : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/5"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT GRID & FILTERS */}
      <section className="py-8 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* FILTER SIDEBAR (3 cols) */}
            <aside className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="size-4 text-emerald-400" />
                  Eligibility Filters
                </span>
              </div>

              {/* Filter 1: Provider Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300">Grant Type</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { id: "all", label: "All Types" },
                    { id: "government", label: "Government" },
                    { id: "private", label: "Private/Trust" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTypeFilter(t.id)}
                      className={`px-3 py-1.5 rounded-lg border text-left cursor-pointer transition ${
                        typeFilter === t.id
                          ? "bg-purple-500/20 border-purple-500 text-purple-300 font-semibold"
                          : "bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/[0.06]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 2: Women Specific */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="flex items-center justify-between cursor-pointer text-xs">
                  <span className="text-pink-300 font-bold flex items-center gap-1.5">
                    <Heart className="size-3.5 fill-pink-400 text-pink-400" />
                    Women in Tech Only
                  </span>
                  <input
                    type="checkbox"
                    checked={womenOnlyFilter}
                    onChange={(e) => setWomenOnlyFilter(e.target.checked)}
                    className="size-4 rounded accent-pink-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Filter 3: Urgent Deadline */}
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer text-xs">
                  <span className="text-amber-300 font-medium flex items-center gap-1.5">
                    <Clock className="size-3.5 text-amber-400" />
                    Closing Soon (&lt; 15 Days)
                  </span>
                  <input
                    type="checkbox"
                    checked={urgentOnly}
                    onChange={(e) => setUrgentOnly(e.target.checked)}
                    className="size-4 rounded accent-amber-500 cursor-pointer"
                  />
                </label>
              </div>
            </aside>

            {/* SCHOLARSHIP CARDS LIST (9 cols) */}
            <div className="lg:col-span-9 space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Showing <strong className="text-white font-bold">{filteredScholarships.length}</strong> eligible grants
                </span>
                <span className="text-purple-400">100% Free Application Guidance</span>
              </div>

              {filteredScholarships.map((sch) => {
                const isReminderSet = reminders.includes(sch.id);
                const currentTrackStatus = trackedScholarships[sch.id] || "none";

                return (
                  <div
                    key={sch.id}
                    className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-md transition duration-200 hover:border-purple-500/40 hover:bg-white/[0.04] space-y-4"
                  >
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="size-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl shrink-0">
                          {sch.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-purple-400">{sch.provider}</span>
                            {sch.isWomenOnly && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full font-bold">
                                <Heart className="size-3 fill-pink-400 text-pink-400" /> Women Only
                              </span>
                            )}
                            {sch.verifiedBySenior && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                                <ShieldCheck className="size-3" /> Senior Verified
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 group-hover:text-purple-300 transition">
                            {sch.title}
                          </h3>
                        </div>
                      </div>

                      {/* Reminder Toggle Button */}
                      <button
                        onClick={() => toggleReminder(sch.id, sch.title)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer shrink-0 ${
                          isReminderSet
                            ? "bg-amber-500/20 border-amber-500 text-amber-300"
                            : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        {isReminderSet ? <BellCheck className="size-3.5 text-amber-400" /> : <Bell className="size-3.5" />}
                        <span>{isReminderSet ? "Reminder Set" : "Set Reminder"}</span>
                      </button>
                    </div>

                    {/* Eligibility Grid */}
                    <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Grant Amount</span>
                        <strong className="text-emerald-400 font-bold">{sch.grantAmount}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Max Family Income</span>
                        <strong className="text-white font-semibold">{sch.eligibility.maxIncome}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Academic Merit</span>
                        <strong className="text-white font-semibold">{sch.eligibility.minMarks}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Deadline</span>
                        <strong className={`font-bold ${sch.isUrgent ? "text-rose-400" : "text-amber-400"}`}>
                          {sch.deadline} ({sch.daysLeft} days left)
                        </strong>
                      </div>
                    </div>

                    {/* Tags & Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {sch.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] bg-white/[0.05] border border-white/10 text-gray-300 px-2.5 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Tracker Dropdown */}
                        <select
                          value={currentTrackStatus}
                          onChange={(e) => updateTrackStatus(sch.id, e.target.value as "saved" | "applied" | "review" | "awarded")}
                          className="bg-black/60 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none"
                        >
                          <option value="none">Set Track Status...</option>
                          <option value="saved">💾 Saved</option>
                          <option value="applied">✅ Applied</option>
                          <option value="review">⏳ Under Review</option>
                          <option value="awarded">🎉 Awarded</option>
                        </select>

                        <button
                          onClick={() => setSelectedDocChecklist(sch)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold hover:bg-purple-500/20 cursor-pointer"
                        >
                          <FileText className="size-3.5" />
                          Docs Checklist
                        </button>

                        <a
                          href={sch.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-semibold text-white shadow-md shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition"
                        >
                          <span>Apply Official</span>
                          <ExternalLink className="size-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENT CHECKLIST MODAL */}
      {selectedDocChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-purple-500/30 bg-[#0f111d] p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedDocChecklist(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
                {selectedDocChecklist.logo}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedDocChecklist.title}</h3>
                <p className="text-xs text-purple-400">{selectedDocChecklist.provider}</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Required Document Checklist
              </span>
              <div className="space-y-1.5">
                {selectedDocChecklist.documentsRequired.map((doc, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-2 text-xs text-gray-300 p-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={selectedDocChecklist.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-purple-600 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-500"
            >
              Open Official Portal Application
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#06070a] py-8 text-xs text-gray-500 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">CampusOS Scholarship Hub</span>
            <span>• 100% Free Financial Guidance for Karnataka Students</span>
          </div>
          <div>© {new Date().getFullYear()} CampusOS Technologies</div>
        </div>
      </footer>
    </main>
  );
}
