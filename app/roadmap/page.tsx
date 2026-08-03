"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  Clock,
  Lock,
  BookOpen,
  Code,
  FolderGit2,
  Award,
  Sparkles,
  ExternalLink,
  X
} from "lucide-react";

// Filter Selector Data
const karnatakaColleges = [
  "RV College of Engineering (RVCE), Bengaluru",
  "BMS College of Engineering (BMSCE), Bengaluru",
  "PES University, Bengaluru",
  "MS Ramaiah Institute of Technology (MSRIT), Bengaluru",
  "KLS Gogte Institute of Technology (GIT), Belagavi",
  "The National Institute of Engineering (NIE), Mysore",
  "Siddaganga Institute of Technology (SIT), Tumakuru",
  "VTU Main Campus, Belagavi",
  "Nitte Meenakshi Institute of Technology (NMIT), Bengaluru",
  "Other Karnataka Engineering College",
];

const engineeringBranches = [
  { id: "cse", label: "Computer Science (CSE)" },
  { id: "ise", label: "Information Science (ISE)" },
  { id: "aiml", label: "AI & Machine Learning (AI&ML)" },
  { id: "ece", label: "Electronics & Comm. (ECE)" },
  { id: "eee", label: "Electrical & Electronics (EEE)" },
  { id: "mech", label: "Mechanical Engineering" },
  { id: "civil", label: "Civil Engineering" },
];

const careerGoals = [
  { id: "sde", label: "Software Engineer (SDE)" },
  { id: "ai_ml", label: "AI / Machine Learning Specialist" },
  { id: "core", label: "Core Electronics / Embedded Systems" },
  { id: "gate", label: "Higher Studies (GATE / MS)" },
  { id: "founder", label: "Startup Founder / Product Creator" },
];

// Roadmap Tree Nodes (Roadmap.sh Style)
const roadmapNodes = [
  {
    id: "sem1_basics",
    sem: 1,
    title: "Sem 1: C Programming & Git Baseline",
    category: "Foundation",
    status: "completed",
    desc: "Master variables, loops, functions, array manipulations, and commit your first code to GitHub.",
    topics: ["Variables & Operators", "Control Flow & Loops", "Functions & Scope", "1D/2D Arrays", "Git & GitHub Setup"],
    resourceLink: "C Programming Lab Senior Playbook",
  },
  {
    id: "sem1_math",
    sem: 1,
    title: "Sem 1: Engg Mathematics I (BMAT101)",
    category: "Academics",
    status: "completed",
    desc: "Calculus, Taylor Series, Curvature, and Cayley-Hamilton Theorem derivations for IA1 & SEE exams.",
    topics: ["Differential Calculus", "Partial Differentiation", "Linear Algebra", "Eigenvalues"],
    resourceLink: "BMAT101 PYQ Frequency Sheet",
  },
  {
    id: "sem2_dsa",
    sem: 2,
    title: "Sem 2: Data Structures Starter in C/C++",
    category: "Core Skill",
    status: "in_progress",
    desc: "Pointers, Dynamic Memory Allocation, Singly Linked Lists, Stacks, Queues, and 25 LeetCode Easy problems.",
    topics: ["Pointers & References", "Malloc / Calloc", "Singly Linked List", "Stack & Queue", "25 LeetCode Problems"],
    resourceLink: "DSA Starter Sheet",
  },
  {
    id: "sem2_project",
    sem: 2,
    title: "Sem 2: First Proof-of-Work Project",
    category: "Projects",
    status: "in_progress",
    desc: "Build a CLI or Web app (e.g. VTU SGPA Calculator or Library Management System) and push to GitHub.",
    topics: ["Project Architecture", "File Handling in C/C++", "GitHub Readme Styling", "Public Demo Link"],
    resourceLink: "Project Spec & Code Template",
  },
  {
    id: "sem3_oop",
    sem: 3,
    title: "Sem 3: Object-Oriented Programming (Java/C++)",
    category: "Core Skill",
    status: "locked",
    desc: "Classes, Inheritance, Polymorphism, Encapsulation, Exception Handling, and File I/O.",
    topics: ["Classes & Objects", "Inheritance", "Polymorphism", "Exception Handling"],
    resourceLink: "OOP Interview Questions",
  },
  {
    id: "sem4_dbms",
    sem: 4,
    title: "Sem 4: DBMS & Web Tech Stack",
    category: "Full Stack",
    status: "locked",
    desc: "SQL queries, Relational Database Design, ER Diagrams, HTML/CSS/JS, and REST API integration.",
    topics: ["SQL Joins & Indexing", "ER Modeling", "HTML5 & Tailwind CSS", "Node.js Basics"],
    resourceLink: "DBMS Lab Queries Cheat Sheet",
  },
];

// Projects Specs Data
const projectSpecs = [
  {
    id: "p1",
    title: "VTU SGPA & CIE Risk Calculator",
    level: "Beginner",
    techStack: ["C++", "Python", "File I/O"],
    desc: "Calculates SGPA/CGPA based on VTU 2022/2025 credit scheme and predicts 75% attendance bunk allowances.",
    deliverables: ["CLI Executable", "GitHub Repository", "Sample Data Input File"],
  },
  {
    id: "p2",
    title: "Campus Event & Hackathon Portal",
    level: "Intermediate",
    techStack: ["React", "Tailwind CSS", "Local Storage"],
    desc: "Web app allowing Karnataka engineering students to filter hackathons by location, prize pool, and team size.",
    deliverables: ["Live Vercel Link", "GitHub Codebase", "Readme Documentation"],
  },
  {
    id: "p3",
    title: "Lab Record Observation Manager",
    level: "Intermediate",
    techStack: ["Python", "SQLite", "Tkinter / Web"],
    desc: "Desktop or web utility to track lab experiment submissions, viva notes, and professor signatures.",
    deliverables: ["Executable Package", "SQL Schema", "User Manual"],
  },
];

// Certifications Data
const certifications = [
  {
    title: "NPTEL Programming in C / Data Structures",
    provider: "IIT Kharagpur / NPTEL India",
    type: "Academic & Credit Transfer",
    duration: "8 - 12 Weeks",
    badge: "VTU Approved Credit",
    desc: "Official NPTEL certificate accepted for college elective credit transfers across Karnataka engineering colleges.",
  },
  {
    title: "AWS Certified Cloud Practitioner (CLF-C02)",
    provider: "Amazon Web Services",
    type: "Industry Certification",
    duration: "4 Weeks Prep",
    badge: "Global Standard",
    desc: "Foundational cloud certification covering AWS EC2, S3, IAM, and cloud architecture basics.",
  },
  {
    title: "Cisco Networking Essentials",
    provider: "Cisco Networking Academy",
    type: "Core Networking",
    duration: "6 Weeks",
    badge: "Industry Badge",
    desc: "Essential networking fundamentals, IP addressing, routing, and network security concepts.",
  },
];

// DSA Track Data
const dsaTrack = [
  { topic: "Arrays & Strings", count: "10 Problems", status: "Completed", difficulty: "Easy" },
  { topic: "Pointers & Memory Allocation", count: "8 Problems", status: "In Progress", difficulty: "Easy / Med" },
  { topic: "Singly & Doubly Linked Lists", count: "7 Problems", status: "Up Next", difficulty: "Easy" },
  { topic: "Stacks & Queues", count: "6 Problems", status: "Locked", difficulty: "Medium" },
  { topic: "Recursion & Backtracking", count: "5 Problems", status: "Locked", difficulty: "Medium" },
];

// Resume Checklist Data
const resumeChecklist = [
  { id: "r1", title: "Setup GitHub Profile & Add Bio", done: true, phase: "Sem 1" },
  { id: "r2", title: "Complete First Proof-of-Work Project (C++/Python)", done: true, phase: "Sem 1" },
  { id: "r3", title: "Solve 25 LeetCode Easy Problems", done: false, phase: "Sem 2" },
  { id: "r4", title: "Join Campus Tech Club (IEEE / GDSC / ACM)", done: false, phase: "Sem 2" },
  { id: "r5", title: "Participate in First 24h Hackathon", done: false, phase: "Sem 2" },
  { id: "r6", title: "Build Full-Stack Project with Live Vercel Link", done: false, phase: "Sem 3" },
];

export default function RoadmapPage() {
  // State Selectors
  const [college, setCollege] = useState(karnatakaColleges[0]);
  const [branch, setBranch] = useState("cse");
  const [semester, setSemester] = useState<number>(2);
  const [goal, setGoal] = useState("sde");

  // Tab State
  const [activeTab, setActiveTab] = useState<"tree" | "projects" | "resources" | "certs" | "dsa" | "resume">("tree");

  // Selected Node Modal State
  const [selectedNode, setSelectedNode] = useState<typeof roadmapNodes[0] | null>(null);

  // Resume Checklist Toggle State
  const [checklistState, setChecklistState] = useState(resumeChecklist);

  const toggleChecklist = (id: string) => {
    setChecklistState(
      checklistState.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <main className="min-h-screen bg-[#08090e] text-[#f3f4f6] selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Glow Mesh */}
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
                CampusOS Roadmap Hub
                <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400 border border-purple-500/20">
                  roadmap.sh Powered
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 hidden sm:flex"
            >
              <Sparkles className="size-3.5" /> Re-run Setup
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

      {/* HERO & CONFIGURATOR BAR */}
      <section className="relative z-10 pt-8 pb-6 border-b border-white/10 bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
              <Compass className="size-4" />
              Interactive Semester Milestone Engine
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Your Personalized Engineering Roadmap.
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Configure your college, branch, semester, and target career goal to receive a node-by-node execution path from Day 1 to Graduation.
            </p>
          </div>

          {/* 4 DROPDOWN CONFIGURATOR BAR */}
          <div className="rounded-2xl border border-white/15 bg-black/60 p-4 backdrop-blur-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">1. College</label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                {karnatakaColleges.map((c, i) => (
                  <option key={i} value={c} className="bg-gray-900 text-gray-200">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">2. Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                {engineeringBranches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-gray-900 text-gray-200">{b.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">3. Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s} className="bg-gray-900 text-gray-200">Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">4. Career Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                {careerGoals.map((g) => (
                  <option key={g.id} value={g.id} className="bg-gray-900 text-gray-200">{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ROADMAP HUB NAVIGATION TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2">
            {[
              { id: "tree", label: "🗺️ Learning Roadmap Tree" },
              { id: "projects", label: "🛠️ Proof-of-Work Projects" },
              { id: "resources", label: "📚 Academic Resources" },
              { id: "certs", label: "📜 Certifications" },
              { id: "dsa", label: "🧠 DSA Mastery Track" },
              { id: "resume", label: "📄 Resume Checklist" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/30"
                      : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* TAB CONTENT SECTIONS */}
      <section className="py-8 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* 1. ROADMAP TREE TAB (roadmap.sh style) */}
          {activeTab === "tree" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Node-Based Roadmap</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                    Sem 1 to Sem 8 Path for {branch.toUpperCase()}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-400" /> Completed</span>
                  <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-cyan-400" /> In Progress</span>
                  <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-gray-600" /> Locked</span>
                </div>
              </div>

              {/* Visual Node Tree Flow */}
              <div className="relative max-w-4xl mx-auto space-y-6 before:absolute before:left-4 sm:before:left-1/2 before:top-0 before:bottom-0 before:w-0.5 before:bg-white/10 before:-translate-x-1/2">
                {roadmapNodes.map((node, idx) => {
                  const isCompleted = node.status === "completed";
                  const isInProgress = node.status === "in_progress";
                  const isLeft = idx % 2 === 0;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`relative flex items-center gap-4 sm:gap-8 cursor-pointer group ${
                        isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                      }`}
                    >
                      {/* Central Node Badge Dot */}
                      <div
                        className={`absolute left-4 sm:left-1/2 -translate-x-1/2 size-9 rounded-full border-2 flex items-center justify-center font-bold text-xs z-10 transition duration-300 ${
                          isCompleted
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/30"
                            : isInProgress
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/30 animate-pulse"
                            : "bg-gray-900 border-gray-700 text-gray-500"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="size-4" /> : isInProgress ? <Clock className="size-4" /> : <Lock className="size-4" />}
                      </div>

                      {/* Card Content Box */}
                      <div className={`ml-12 sm:ml-0 sm:w-1/2 ${isLeft ? "sm:pr-10 sm:text-right" : "sm:pl-10 sm:text-left"}`}>
                        <div
                          className={`rounded-2xl border p-5 backdrop-blur-md transition duration-200 group-hover:-translate-y-1 ${
                            isCompleted
                              ? "bg-emerald-500/5 border-emerald-500/30 group-hover:border-emerald-500/60"
                              : isInProgress
                              ? "bg-purple-500/10 border-purple-500/40 group-hover:border-purple-500/70"
                              : "bg-white/[0.02] border-white/10 opacity-60"
                          }`}
                        >
                          <div className={`flex items-center gap-2 mb-2 ${isLeft ? "sm:justify-end" : "sm:justify-start"}`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-gray-300">
                              {node.category}
                            </span>
                            <span className="text-[10px] font-semibold text-purple-400">
                              Sem {node.sem}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                            {node.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                            {node.desc}
                          </p>

                          <div className={`flex flex-wrap gap-1 mt-3 ${isLeft ? "sm:justify-end" : "sm:justify-start"}`}>
                            {node.topics.slice(0, 3).map((topic, tIdx) => (
                              <span key={tIdx} className="text-[10px] bg-white/[0.05] text-gray-300 px-2 py-0.5 rounded border border-white/5">
                                {topic}
                              </span>
                            ))}
                            {node.topics.length > 3 && (
                              <span className="text-[10px] text-purple-400 font-semibold px-1">+More</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. PROOF-OF-WORK PROJECTS TAB */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Proof of Work Builder</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Recommended 1st & 2nd Year Projects</h2>
                <p className="text-xs text-gray-400 mt-1">Pre-configured project specifications to build real portfolio proof of work.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projectSpecs.map((proj) => (
                  <div key={proj.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4 hover:border-purple-500/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded border border-purple-500/30">
                        {proj.level}
                      </span>
                      <FolderGit2 className="size-5 text-purple-400" />
                    </div>

                    <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{proj.desc}</p>

                    <div className="space-y-2 border-t border-white/10 pt-3">
                      <span className="text-[11px] font-semibold text-gray-400 block">Deliverables Required:</span>
                      {proj.deliverables.map((del, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-2 text-xs text-gray-300">
                          <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {proj.techStack.map((tech, tIdx) => (
                        <span key={tIdx} className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ACADEMIC & TECH RESOURCES TAB */}
          {activeTab === "resources" && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Academic Vault</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">VTU & Autonomous Verified Notes</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <BookOpen className="size-4" />
                    <span>Engg Mathematics I (BMAT101) Notes</span>
                  </div>
                  <h3 className="text-base font-bold text-white">VTU Module 1 to 5 Formula Cheat Sheet</h3>
                  <p className="text-xs text-gray-400">Includes top 15 repeated derivations for Calculus and Linear Algebra.</p>
                  <a href="#download" className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 pt-1">
                    Download PDF Playbook <ExternalLink className="size-3.5" />
                  </a>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <Code className="size-4" />
                    <span>C Programming Lab Viva Vault</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Top 30 C Pointers & Structures Viva Q&As</h3>
                  <p className="text-xs text-gray-400">Vetted by 3rd-year RVCE & BMSCE seniors for external lab exams.</p>
                  <a href="#download" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 pt-1">
                    Download Viva PDF <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 4. RECOMMENDED CERTIFICATIONS TAB */}
          {activeTab === "certs" && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Industry & Academic Certifications</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">High-Yield Certifications for 1st/2nd Year</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                        {cert.badge}
                      </span>
                      <Award className="size-5 text-emerald-400" />
                    </div>

                    <h3 className="text-base font-bold text-white">{cert.title}</h3>
                    <span className="text-xs text-purple-400 block font-medium">{cert.provider}</span>
                    <p className="text-xs text-gray-400 leading-relaxed">{cert.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. DSA MASTERY TRACK TAB */}
          {activeTab === "dsa" && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">LeetCode Starter Track</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">First-Year Data Structures Progression</h2>
              </div>

              <div className="space-y-3">
                {dsaTrack.map((track, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                        0{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{track.topic}</h4>
                        <span className="text-xs text-gray-400">{track.count} • Difficulty: {track.difficulty}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      track.status === "Completed" ? "bg-emerald-500/20 text-emerald-300" : track.status === "In Progress" ? "bg-cyan-500/20 text-cyan-300" : "bg-white/10 text-gray-400"
                    }`}>
                      {track.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. RESUME CHECKLIST TAB */}
          {activeTab === "resume" && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Career Readiness</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">1st & 2nd Year Resume Readiness Checklist</h2>
              </div>

              <div className="space-y-2 max-w-2xl">
                {checklistState.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      item.done
                        ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                        : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-5 rounded-md border flex items-center justify-center ${item.done ? "bg-emerald-500 border-emerald-400 text-white" : "border-gray-600"}`}>
                        {item.done && <CheckCircle2 className="size-4" />}
                      </div>
                      <span className={`text-xs sm:text-sm ${item.done ? "line-through text-gray-400" : "font-medium text-white"}`}>
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded font-bold">
                      {item.phase}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* NODE DETAIL MODAL */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-purple-500/30 bg-[#0f111d] p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Sem {selectedNode.sem} Node Inspection
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{selectedNode.title}</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">{selectedNode.desc}</p>

            <div className="space-y-2 border-t border-white/10 pt-3">
              <span className="text-xs font-semibold text-gray-300 block">Topics Covered in this Node:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.topics.map((t, idx) => (
                  <span key={idx} className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded border border-purple-500/30">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> {selectedNode.resourceLink} Attached
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-500"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#06070a] py-8 text-xs text-gray-500 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">CampusOS Roadmap Hub</span>
            <span>• Inspired by roadmap.sh for Karnataka Engineers</span>
          </div>
          <div>© {new Date().getFullYear()} CampusOS Technologies</div>
        </div>
      </footer>
    </main>
  );
}
