"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  GraduationCap,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Users,
  DollarSign,
  Briefcase,
  SlidersHorizontal,
  X,
  ShieldCheck
} from "lucide-react";

// Opportunity Categories
const categories = [
  { id: "all", label: "All Opportunities", count: 48 },
  { id: "internships", label: "Internships", count: 14 },
  { id: "hackathons", label: "Hackathons", count: 10 },
  { id: "scholarships", label: "Scholarships", count: 8 },
  { id: "competitions", label: "Competitions", count: 6 },
  { id: "opensource", label: "Open Source", count: 5 },
  { id: "campus_drives", label: "Campus Drives", count: 5 },
];

// Mock Opportunities Data (Tailored for Karnataka Students)
const opportunitiesData = [
  {
    id: "1",
    title: "SDE Summer Intern 2026",
    organization: "Bosch Global Software Technologies",
    logo: "⚡",
    category: "internships",
    workMode: "Hybrid",
    location: "Bengaluru, KA",
    batch: ["2026", "2027"],
    minCGPA: 7.0,
    stipend: "₹35,000 / month",
    isPaid: true,
    deadline: "In 3 days",
    isUrgent: true,
    tags: ["C++", "Python", "Embedded Systems", "Linux"],
    description: "Build automotive software & cloud microservices with Bosch India engineering teams.",
    teammatesNeeded: false,
    verifiedBySenior: true,
  },
  {
    id: "2",
    title: "RVCE National Hackathon 2026 (HackRVCE)",
    organization: "RV College of Engineering • IEEE Student Branch",
    logo: "🏆",
    category: "hackathons",
    workMode: "On-site",
    location: "Bengaluru, KA",
    batch: ["2025", "2026", "2027", "2028"],
    minCGPA: 0.0,
    stipend: "₹1,50,000 Prize Pool",
    isPaid: true,
    deadline: "In 5 days",
    isUrgent: false,
    tags: ["Web Dev", "AI/ML", "IoT", "Open Track"],
    description: "36-hour flagship hackathon at RVCE Campus. Free food, schwag & direct interview bypass for top 3 teams.",
    teammatesNeeded: true,
    verifiedBySenior: true,
  },
  {
    id: "3",
    title: "SSP Karnataka Post-Matric State Scholarship",
    organization: "Government of Karnataka • State Scholarship Portal",
    logo: "🎓",
    category: "scholarships",
    workMode: "Remote",
    location: "Karnataka State",
    batch: ["2025", "2026", "2027", "2028"],
    minCGPA: 6.0,
    stipend: "₹25,000 / year",
    isPaid: true,
    deadline: "In 12 days",
    isUrgent: false,
    tags: ["Government Grant", "SSP Portal", "Tuition Fee Reimbursement"],
    description: "State government merit & fee reimbursement grant for engineering students in VTU & Autonomous colleges.",
    teammatesNeeded: false,
    verifiedBySenior: fontTrue(),
  },
  {
    id: "4",
    title: "Google Summer of Code (GSoC) 2026",
    organization: "Google Open Source",
    logo: "🌐",
    category: "opensource",
    workMode: "Remote",
    location: "Global Remote",
    batch: ["2025", "2026", "2027", "2028"],
    minCGPA: 0.0,
    stipend: "$1,500 - $3,000 Stipend",
    isPaid: true,
    deadline: "In 8 days",
    isUrgent: false,
    tags: ["Open Source", "Git", "Python", "Go", "Rust"],
    description: "12-week global remote program writing code for open source organizations under expert mentors.",
    teammatesNeeded: false,
    verifiedBySenior: true,
  },
  {
    id: "5",
    title: "Cisco Campus Graduate Placement Drive",
    organization: "Cisco Systems India",
    logo: "🚀",
    category: "campus_drives",
    workMode: "On-site",
    location: "Bengaluru, KA",
    batch: ["2026"],
    minCGPA: 8.0,
    stipend: "18.5 LPA (CTC)",
    isPaid: true,
    deadline: "In 48 hours",
    isUrgent: true,
    tags: ["Networking", "Python", "DSA", "Operating Systems"],
    description: "Exclusive campus placement drive for Karnataka engineering colleges. Online test on Thursday.",
    teammatesNeeded: false,
    verifiedBySenior: true,
  },
  {
    id: "6",
    title: "IEEE Xtreme 24-Hour Competitive Coding",
    organization: "IEEE Global",
    logo: "⚡",
    category: "competitions",
    workMode: "Remote",
    location: "Online / Local Campus",
    batch: ["2025", "2026", "2027", "2028"],
    minCGPA: 0.0,
    stipend: "Global Ranking & Trips",
    isPaid: false,
    deadline: "In 6 days",
    isUrgent: false,
    tags: ["DSA", "Algorithms", "C++", "Competitive Programming"],
    description: "Virtual 24-hour algorithmic battle against 10,000+ IEEE student members worldwide.",
    teammatesNeeded: true,
    verifiedBySenior: true,
  },
];

function fontTrue() {
  return true;
}

export default function OpportunitiesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>(["2"]);

  // Filter States
  const [workModeFilter, setWorkModeFilter] = useState("all"); // all, remote, hybrid, onsite
  const [batchFilter, setBatchFilter] = useState("all"); // all, 2025, 2026, 2027, 2028
  const [cgpaFilter, setCgpaFilter] = useState("all"); // all, nocgpa, 7plus, 8plus
  const [paidOnly, setPaidOnly] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);

  const [showTeammateModal, setShowTeammateModal] = useState(false);
  const [selectedOppForTeammates, setSelectedOppForTeammates] = useState<string | null>(null);

  const toggleBookmark = (id: string) => {
    if (bookmarks.includes(id)) {
      setBookmarks(bookmarks.filter((b) => b !== id));
    } else {
      setBookmarks([...bookmarks, id]);
    }
  };

  // Filter Logic
  const filteredOpportunities = opportunitiesData.filter((opp) => {
    // Category match
    if (activeCategory !== "all" && opp.category !== activeCategory) return false;

    // Search query match
    if (
      searchQuery &&
      !opp.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !opp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }

    // Work Mode
    if (workModeFilter !== "all" && opp.workMode.toLowerCase() !== workModeFilter.toLowerCase()) {
      return false;
    }

    // Batch Filter
    if (batchFilter !== "all" && !opp.batch.includes(batchFilter)) {
      return false;
    }

    // CGPA Filter
    if (cgpaFilter === "nocgpa" && opp.minCGPA > 0) return false;
    if (cgpaFilter === "7plus" && opp.minCGPA < 7.0) return false;
    if (cgpaFilter === "8plus" && opp.minCGPA < 8.0) return false;

    // Paid Only
    if (paidOnly && !opp.isPaid) return false;

    // Urgent Only
    if (urgentOnly && !opp.isUrgent) return false;

    return true;
  });

  const clearFilters = () => {
    setWorkModeFilter("all");
    setBatchFilter("all");
    setCgpaFilter("all");
    setPaidOnly(false);
    setUrgentOnly(false);
    setSearchQuery("");
    setActiveCategory("all");
  };

  const hasActiveFilters =
    workModeFilter !== "all" ||
    batchFilter !== "all" ||
    cgpaFilter !== "all" ||
    paidOnly ||
    urgentOnly ||
    searchQuery !== "" ||
    activeCategory !== "all";

  return (
    <main className="min-h-screen bg-[#08090e] text-[#f3f4f6] selection:bg-purple-500/30 selection:text-purple-200">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-radial-glow opacity-80" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#08090e]/80 border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 font-bold text-white shadow-lg shadow-purple-500/25">
              CO
            </Link>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                CampusOS Opportunity Hub
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  Karnataka Verified
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 hidden sm:flex"
            >
              <Sparkles className="size-3.5" /> Onboarding
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

      {/* HERO BANNER SECTION */}
      <section className="relative z-10 pt-8 pb-6 border-b border-white/10 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                <Briefcase className="size-4" />
                Karnataka Engineering Opportunity Hub
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Discover Verified Internships, Hackathons & Grants.
              </h1>
              <p className="text-sm text-gray-400 max-w-2xl">
                No fake WhatsApp listings or broken links. Filter by your exact batch year, CGPA requirement, location preference, and deadline.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-center min-w-[100px]">
                <span className="text-xl font-bold text-white block">48+</span>
                <span className="text-[11px] text-purple-300 block">Active Listings</span>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center min-w-[100px]">
                <span className="text-xl font-bold text-white block">₹12.5L+</span>
                <span className="text-[11px] text-emerald-300 block">Grants & Prizes</span>
              </div>
            </div>
          </div>

          {/* SEARCH BAR & CATEGORY TABS */}
          <div className="mt-8 space-y-4">
            {/* Search Input */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, title, or skills (e.g. Bosch, GSoC, Python, C++)..."
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
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
            {/* FILTER SIDEBAR (3 cols on desktop) */}
            <aside className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="size-4 text-purple-400" />
                  Opportunity Filters
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Filter 1: Work Mode / Location */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300">Work Mode / Location</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { id: "all", label: "All Modes" },
                    { id: "remote", label: "Remote" },
                    { id: "hybrid", label: "Hybrid" },
                    { id: "onsite", label: "On-site KA" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setWorkModeFilter(m.id)}
                      className={`px-3 py-1.5 rounded-lg border text-left cursor-pointer transition ${
                        workModeFilter === m.id
                          ? "bg-purple-500/20 border-purple-500 text-purple-300 font-semibold"
                          : "bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/[0.06]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 2: Batch Year */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300">Target Batch Year</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {["all", "2025", "2026", "2027", "2028"].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBatchFilter(b)}
                      className={`px-2.5 py-1.5 rounded-lg border text-center cursor-pointer transition ${
                        batchFilter === b
                          ? "bg-purple-500/20 border-purple-500 text-purple-300 font-semibold"
                          : "bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/[0.06]"
                      }`}
                    >
                      {b === "all" ? "All" : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 3: CGPA Requirement */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300">CGPA Requirement</label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: "all", label: "Any CGPA" },
                    { id: "nocgpa", label: "No CGPA Cutoff (0.0)" },
                    { id: "7plus", label: "7.0+ CGPA Only" },
                    { id: "8plus", label: "8.0+ CGPA Only" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCgpaFilter(c.id)}
                      className={`w-full px-3 py-1.5 rounded-lg border text-left cursor-pointer transition ${
                        cgpaFilter === c.id
                          ? "bg-purple-500/20 border-purple-500 text-purple-300 font-semibold"
                          : "bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/[0.06]"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-300 font-medium">Paid / Stipend Only</span>
                  <input
                    type="checkbox"
                    checked={paidOnly}
                    onChange={(e) => setPaidOnly(e.target.checked)}
                    className="size-4 rounded accent-purple-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-300 font-medium">Urgent (&lt; 48h Deadline)</span>
                  <input
                    type="checkbox"
                    checked={urgentOnly}
                    onChange={(e) => setUrgentOnly(e.target.checked)}
                    className="size-4 rounded accent-rose-500 cursor-pointer"
                  />
                </label>
              </div>
            </aside>

            {/* OPPORTUNITY CARDS LIST (9 cols on desktop) */}
            <div className="lg:col-span-9 space-y-4">
              {/* Active Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-gray-400">
                  Showing <strong className="text-white font-bold">{filteredOpportunities.length}</strong> verified opportunities
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Sort by:</span>
                  <select className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none">
                    <option>Deadline (Earliest First)</option>
                    <option>Stipend (Highest First)</option>
                    <option>Recently Added</option>
                  </select>
                </div>
              </div>

              {/* EMPTY STATE */}
              {filteredOpportunities.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center space-y-4">
                  <div className="size-14 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                    <Search className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No matching opportunities found</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Try relaxing your filters or clearing your search query to see more listings.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/30 hover:bg-purple-500 cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* CARDS LIST */}
              {filteredOpportunities.map((opp) => {
                const isBookmarked = bookmarks.includes(opp.id);
                return (
                  <div
                    key={opp.id}
                    className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-md transition duration-200 hover:border-purple-500/40 hover:bg-white/[0.04] space-y-4"
                  >
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="size-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl shrink-0">
                          {opp.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-purple-400">{opp.organization}</span>
                            {opp.verifiedBySenior && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                                <ShieldCheck className="size-3" /> Senior Verified
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 group-hover:text-purple-300 transition">
                            {opp.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleBookmark(opp.id)}
                        className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
                          isBookmarked
                            ? "bg-purple-500/20 border-purple-500 text-purple-300"
                            : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {opp.description}
                    </p>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-3 text-xs border-t border-white/10 pt-3 text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-purple-400" />
                        {opp.location} ({opp.workMode})
                      </span>

                      <span className="flex items-center gap-1">
                        <GraduationCap className="size-3.5 text-cyan-400" />
                        Batch: {opp.batch.join(", ")}
                      </span>

                      <span className="flex items-center gap-1">
                        <DollarSign className="size-3.5 text-emerald-400" />
                        <strong className="text-white">{opp.stipend}</strong>
                      </span>

                      <span className={`flex items-center gap-1 font-medium ${opp.isUrgent ? "text-rose-400" : "text-amber-400"}`}>
                        <Clock className="size-3.5" />
                        Deadline: {opp.deadline}
                      </span>
                    </div>

                    {/* Tech Stack Tags & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {opp.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] bg-white/[0.05] border border-white/10 text-gray-300 px-2.5 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {opp.teammatesNeeded && (
                          <button
                            onClick={() => {
                              setSelectedOppForTeammates(opp.title);
                              setShowTeammateModal(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold hover:bg-cyan-500/20 cursor-pointer"
                          >
                            <Users className="size-3.5" />
                            Find Teammates
                          </button>
                        )}
                        <a
                          href="#apply"
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-semibold text-white shadow-md shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition"
                        >
                          <span>Apply Now</span>
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

      {/* TEAMMATE MATCHMAKER MODAL */}
      {showTeammateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-purple-500/30 bg-[#0f111d] p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowTeammateModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Users className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Find Teammates</h3>
                <p className="text-xs text-gray-400">{selectedOppForTeammates}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <p>Connect with other students from RVCE, BMSCE, PES, or VTU colleges looking for hackathon partners.</p>
              
              <div className="space-y-2 pt-1">
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Rahul M. (RVCE • CSE Sem 3)</span>
                    <span className="text-gray-400 text-[11px]">Role: React & Tailwind Frontend</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">Available</span>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Ananya S. (BMSCE • AIML Sem 1)</span>
                    <span className="text-gray-400 text-[11px]">Role: Python & Machine Learning</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">Available</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTeammateModal(false)}
              className="w-full flex h-10 items-center justify-center rounded-xl bg-purple-600 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-500"
            >
              Post &quot;Looking for Teammates&quot; Entry
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#06070a] py-8 text-xs text-gray-500 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">CampusOS Opportunity Hub</span>
            <span>• 100% Verified for Karnataka Engineering Campuses</span>
          </div>
          <div>© {new Date().getFullYear()} CampusOS Technologies</div>
        </div>
      </footer>
    </main>
  );
}
