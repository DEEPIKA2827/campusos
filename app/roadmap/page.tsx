/**
 * @file app/roadmap/page.tsx
 * @description Interactive Roadmap & Milestone Hub for CampusOS.
 * @purpose Renders node-by-node semester progress tree; integrates with /api/roadmaps and /api/roadmaps/[id]/progress.
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { RoadmapNodeDTO, RoadmapProgressStatus } from "@/types/api.types";
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
  X,
  Check
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

export interface NodeItem {
  id: string;
  nodeId?: number;
  roadmapId?: number;
  sem: number;
  title: string;
  category: string;
  status: "completed" | "in_progress" | "locked" | "available";
  desc: string;
  topics: string[];
  resourceLink: string;
}

// Fallback Curated Nodes
const defaultRoadmapNodes: NodeItem[] = [
  {
    id: "1",
    nodeId: 1,
    roadmapId: 1,
    sem: 1,
    title: "Sem 1: C Programming & Git Baseline",
    category: "Foundation",
    status: "completed",
    desc: "Master variables, loops, functions, array manipulations, and commit your first code to GitHub.",
    topics: ["Variables & Operators", "Control Flow & Loops", "Functions & Scope", "1D/2D Arrays", "Git & GitHub Setup"],
    resourceLink: "C Programming Lab Senior Playbook",
  },
  {
    id: "2",
    nodeId: 2,
    roadmapId: 1,
    sem: 1,
    title: "Sem 1: Engg Mathematics I (BMAT101)",
    category: "Academics",
    status: "completed",
    desc: "Calculus, Taylor Series, Curvature, and Cayley-Hamilton Theorem derivations for IA1 & SEE exams.",
    topics: ["Differential Calculus", "Partial Differentiation", "Linear Algebra", "Eigenvalues"],
    resourceLink: "BMAT101 PYQ Frequency Sheet",
  },
  {
    id: "3",
    nodeId: 3,
    roadmapId: 1,
    sem: 2,
    title: "Sem 2: Data Structures Starter in C/C++",
    category: "Core Skill",
    status: "in_progress",
    desc: "Pointers, Dynamic Memory Allocation, Singly Linked Lists, Stacks, Queues, and 25 LeetCode Easy problems.",
    topics: ["Pointers & References", "Malloc / Calloc", "Singly Linked List", "Stack & Queue", "25 LeetCode Problems"],
    resourceLink: "DSA Starter Sheet",
  },
  {
    id: "4",
    nodeId: 4,
    roadmapId: 1,
    sem: 2,
    title: "Sem 2: First Proof-of-Work Project",
    category: "Projects",
    status: "in_progress",
    desc: "Build a CLI or Web app (e.g. VTU SGPA Calculator or Library Management System) and push to GitHub.",
    topics: ["Project Architecture", "File Handling in C/C++", "GitHub Readme Styling", "Public Demo Link"],
    resourceLink: "Project Spec & Code Template",
  },
  {
    id: "5",
    nodeId: 5,
    roadmapId: 1,
    sem: 3,
    title: "Sem 3: Object-Oriented Programming (Java/C++)",
    category: "Core Skill",
    status: "locked",
    desc: "Classes, Inheritance, Polymorphism, Encapsulation, Exception Handling, and File I/O.",
    topics: ["Classes & Objects", "Inheritance", "Polymorphism", "Exception Handling"],
    resourceLink: "OOP Interview Questions",
  },
  {
    id: "6",
    nodeId: 6,
    roadmapId: 1,
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

  const [nodes, setNodes] = useState<NodeItem[]>(defaultRoadmapNodes);
  const [activeRoadmapId, setActiveRoadmapId] = useState<number>(1);

  // Tab State
  const [activeTab, setActiveTab] = useState<"tree" | "projects" | "resources" | "certs" | "dsa" | "resume">("tree");

  // Selected Node Modal State
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);

  // Resume Checklist Toggle State
  const [checklistState, setChecklistState] = useState(resumeChecklist);

  // Fetch active roadmap and nodes from API on mount
  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const res = await fetch("/api/roadmaps", { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const firstRoadmap = json.data[0];
            setActiveRoadmapId(firstRoadmap.roadmapId);

            // Fetch nodes for active roadmap
            const nodesRes = await fetch(`/api/roadmaps/${firstRoadmap.roadmapId}`, {
              credentials: "include",
            });
            if (nodesRes.ok) {
              const nodesJson = await nodesRes.json();
              if (nodesJson.success && nodesJson.data?.nodes) {
                const apiNodes: RoadmapNodeDTO[] = nodesJson.data.nodes;
                const progressMap: Record<number, RoadmapProgressStatus> = {};
                if (Array.isArray(nodesJson.data.userProgress)) {
                  nodesJson.data.userProgress.forEach((p: { nodeId: number; status: RoadmapProgressStatus }) => {
                    progressMap[p.nodeId] = p.status;
                  });
                }

                if (apiNodes.length > 0) {
                  const mapped: NodeItem[] = apiNodes.map((n, idx) => {
                    const fallback = defaultRoadmapNodes[idx % defaultRoadmapNodes.length];
                    const userStatus = progressMap[n.nodeId] || (idx === 0 ? "completed" : idx === 1 ? "in_progress" : "locked");

                    return {
                      id: String(n.nodeId),
                      nodeId: n.nodeId,
                      roadmapId: firstRoadmap.roadmapId,
                      sem: Math.min(8, Math.max(1, Math.ceil((n.sequenceNo || idx + 1) / 2))),
                      title: n.title,
                      category: fallback?.category || "Core Skill",
                      status: userStatus as "completed" | "in_progress" | "locked" | "available",
                      desc: n.description || fallback?.desc || "Master key competencies for this milestone.",
                      topics: fallback?.topics || ["Core Fundamentals", "Practical Labs", "Exam Derivations"],
                      resourceLink: fallback?.resourceLink || "Senior Notes Attached",
                    };
                  });
                  setNodes(mapped);
                }
              }
            }
          }
        }
      } catch {
        // Fallback gracefully to default curated nodes
      }
    };

    fetchRoadmaps();
  }, []);

  /**
   * Updates node progress and persists to /api/roadmaps/[id]/progress
   */
  const updateNodeStatus = async (node: NodeItem, newStatus: "completed" | "in_progress" | "available" | "locked") => {
    const updated = nodes.map((n) => (n.id === node.id ? { ...n, status: newStatus } : n));
    setNodes(updated);

    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode({ ...selectedNode, status: newStatus });
    }

    if (node.nodeId) {
      try {
        const roadmapId = node.roadmapId || activeRoadmapId;
        await fetch(`/api/roadmaps/${roadmapId}/progress`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            nodeId: node.nodeId,
            status: newStatus === "locked" ? "not_started" : newStatus,
          }),
        });
      } catch {
        // Graceful silent fallback
      }
    }
  };

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

      {/* DYNAMIC HEADER NAVBAR */}
      <Navbar />

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
        </div>
      </section>

      {/* 6 OUTPUT TABS NAVIGATION */}
      <section className="relative z-10 border-b border-white/10 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
            {[
              { id: "tree", label: "Learning Tree (Visual Nodes)", icon: Compass },
              { id: "projects", label: "Proof-of-Work Projects", icon: FolderGit2 },
              { id: "dsa", label: "DSA & LeetCode Track", icon: Code },
              { id: "certs", label: "Industry Certifications", icon: Award },
              { id: "resume", label: "Resume Milestone Checklist", icon: CheckCircle2 },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <IconComp className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <section className="relative z-10 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* TAB 1: LEARNING TREE NODES */}
          {activeTab === "tree" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Visual Milestone Roadmap</h2>
                  <p className="text-xs text-gray-400">Click any milestone node to view topics, senior playbooks, and update progress status.</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Completed
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                    <span className="size-2 rounded-full bg-purple-400" /> In Progress
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <span className="size-2 rounded-full bg-gray-500" /> Locked
                  </span>
                </div>
              </div>

              {/* NODE TREE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nodes.map((node) => {
                  const isCompleted = node.status === "completed";
                  const isInProgress = node.status === "in_progress";

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`group relative rounded-3xl border p-5 shadow-xl transition-all cursor-pointer flex flex-col justify-between ${
                        isCompleted
                          ? "border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/60"
                          : isInProgress
                          ? "border-purple-500/40 bg-purple-950/20 hover:border-purple-500/80 animate-pulse-glow"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 opacity-70"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Sem {node.sem} • {node.category}
                          </span>
                          {isCompleted ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="size-3" /> Done
                            </span>
                          ) : isInProgress ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                              <Clock className="size-3" /> In Progress
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                              <Lock className="size-3" /> Locked
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                          {node.title}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {node.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-500">{node.topics.length} Key Topics</span>
                        <span className="text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                          Inspect Node →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PROOF-OF-WORK PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Recommended Proof-of-Work Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projectSpecs.map((p) => (
                  <div key={p.id} className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400">{p.level}</span>
                      <div className="flex gap-1">
                        {p.techStack.map((t, idx) => (
                          <span key={idx} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-gray-400">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DSA TRACK */}
          {activeTab === "dsa" && (
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-lg font-bold text-white">1st & 2nd Year DSA Progression</h2>
              <div className="space-y-2">
                {dsaTrack.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <div className="space-y-0.5">
                      <strong className="text-xs sm:text-sm text-white block">{t.topic}</strong>
                      <span className="text-[11px] text-gray-400">{t.count} • {t.difficulty}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-white/5 text-gray-300">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CERTIFICATIONS */}
          {activeTab === "certs" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certifications.map((c, idx) => (
                <div key={idx} className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold uppercase">
                    {c.badge}
                  </span>
                  <h3 className="text-sm font-bold text-white">{c.title}</h3>
                  <span className="text-xs text-gray-400 block">{c.provider} • {c.duration}</span>
                  <p className="text-xs text-gray-400 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: RESUME CHECKLIST */}
          {activeTab === "resume" && (
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-lg font-bold text-white">Engineering Resume Milestones</h2>
              <div className="space-y-2">
                {checklistState.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition"
                  >
                    <div className={`size-5 rounded-md flex items-center justify-center border ${
                      item.done ? "bg-purple-600 border-purple-500 text-white" : "border-white/20"
                    }`}>
                      {item.done && <Check className="size-3.5" />}
                    </div>
                    <div className="flex-1">
                      <span className={`text-xs sm:text-sm block ${item.done ? "line-through text-gray-500" : "text-white"}`}>
                        {item.title}
                      </span>
                      <span className="text-[10px] text-gray-500">{item.phase}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* NODE INSPECTOR MODAL */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-purple-500/30 bg-[#0d0f18] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                  Semester {selectedNode.sem} • {selectedNode.category}
                </span>
                <h3 className="text-base font-bold text-white">{selectedNode.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">{selectedNode.desc}</p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400">Key Syllabus Topics:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.topics.map((t, idx) => (
                  <span key={idx} className="rounded-lg bg-white/[0.05] border border-white/10 px-2.5 py-1 text-xs text-gray-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress Selector */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-gray-400">Update Status:</span>
              <div className="grid grid-cols-3 gap-2">
                {(["completed", "in_progress", "locked"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateNodeStatus(selectedNode, st)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition capitalize cursor-pointer ${
                      selectedNode.status === st
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedNode(null)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
