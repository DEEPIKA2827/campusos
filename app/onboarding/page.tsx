"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Code,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Rocket,
  Check,
  Zap,
  ArrowRight,
  Globe,
  Flame
} from "lucide-react";

// Onboarding Data Models (9 Questions)
const collegesList = [
  "RV College of Engineering (RVCE), Bengaluru",
  "BMS College of Engineering (BMSCE), Bengaluru",
  "PES University, Bengaluru",
  "MS Ramaiah Institute of Technology (MSRIT), Bengaluru",
  "Nitte Meenakshi Institute of Technology (NMIT), Bengaluru",
  "KLS Gogte Institute of Technology (GIT), Belagavi",
  "The National Institute of Engineering (NIE), Mysore",
  "Siddaganga Institute of Technology (SIT), Tumakuru",
  "SJCE (JSSSTU), Mysore",
  "VTU Main Campus, Belagavi",
  "BMSIT & Management, Bengaluru",
  "Bangalore Institute of Technology (BIT), Bengaluru",
  "Dayananda Sagar College of Engineering (DSCE), Bengaluru",
  "Sir M. Visvesvaraya Institute of Technology (SIR MVIT), Bengaluru",
  "KLE Technological University, Hubballi",
  "Other Engineering College in Karnataka",
];

const branchesList = [
  { id: "cse", label: "Computer Science & Engg (CSE)", category: "Software" },
  { id: "ise", label: "Information Science (ISE)", category: "Software" },
  { id: "aiml", label: "AI & Machine Learning (AI&ML / AI&DS)", category: "Emerging Tech" },
  { id: "ece", label: "Electronics & Comm. (ECE)", category: "Circuit Branch" },
  { id: "eee", label: "Electrical & Electronics (EEE)", category: "Circuit Branch" },
  { id: "mech", label: "Mechanical Engineering", category: "Core" },
  { id: "civil", label: "Civil Engineering", category: "Core" },
  { id: "other", label: "Biotech / Chemical / Other", category: "Interdisciplinary" },
];

const semesterList = [
  { sem: 1, label: "Semester 1", badge: "Physics / Chem Cycle" },
  { sem: 2, label: "Semester 2", badge: "C Programming & Basic Engg" },
  { sem: 3, label: "Semester 3", badge: "Core Branch Orientation" },
  { sem: 4, label: "Semester 4", badge: "DSA & Mini Projects" },
  { sem: 5, label: "Semester 5", badge: "Specialization & Internships" },
  { sem: 6, label: "Semester 6", badge: "Placement Acceleration" },
  { sem: 7, label: "Semester 7", badge: "Campus Placement Drives" },
  { sem: 8, label: "Semester 8", badge: "Major Project & Graduation" },
];

const evaluationTypes = [
  {
    id: "vtu",
    title: "VTU Affiliated College",
    desc: "Central VTU 2022/2025 scheme (50-mark CIE + 50-mark SEE).",
    badge: "VTU Central",
  },
  {
    id: "autonomous",
    title: "Autonomous College",
    desc: "College-specific CIE rubrics & internal credit evaluation.",
    badge: "Autonomous",
  },
];

const careerGoals = [
  {
    id: "sde",
    title: "Software Engineer (SDE)",
    desc: "Target product tech companies with high DSA & System Design focus.",
    icon: Code,
  },
  {
    id: "ai_ml",
    title: "AI / Machine Learning Specialist",
    desc: "Focus on Data Science, LLMs, Neural Networks & Python.",
    icon: BrainCircuit,
  },
  {
    id: "core",
    title: "Core Electronics / Embedded / Robotics",
    desc: "Focus on VLSI, Microcontrollers, IoT & Hardware Systems.",
    icon: Zap,
  },
  {
    id: "higher_ed",
    title: "Higher Studies (GATE / MS / MBA)",
    desc: "Prepare for competitive entrance exams & research admissions.",
    icon: GraduationCap,
  },
  {
    id: "founder",
    title: "Startup Founder / Product Builder",
    desc: "Build real-world web/mobile products and find hackathon teammates.",
    icon: Rocket,
  },
];

const programmingLevels = [
  { id: "beginner", title: "Absolute Beginner", desc: "Never written code before (Fresh Start)", xp: "+10 XP" },
  { id: "c_basic", title: "C / C++ Basics", desc: "Know variables, loops, arrays & basic functions", xp: "+20 XP" },
  { id: "python_basic", title: "Python Practitioner", desc: "Can write basic scripts and data manipulations", xp: "+30 XP" },
  { id: "web_dev", title: "Web / App Builder", desc: "Built HTML/CSS/JS or mobile apps before", xp: "+40 XP" },
];

const languagesList = [
  { id: "english", label: "English", native: "English (Default)" },
  { id: "kannada", label: "Kannada", native: "ಕನ್ನಡ (Karnataka Native)" },
  { id: "hindi", label: "Hindi", native: "हिंदी (Hindi)" },
];

const studyTimeOptions = [
  { id: "15mins", title: "15 mins / day", tag: "Casual Pace", desc: "Quick daily streak maintenance & notes review." },
  { id: "30mins", title: "30 mins / day", tag: "Steady (Recommended)", desc: "Optimal pace for 1st-year subject mastery." },
  { id: "1hr", title: "1 hr / day", tag: "Focused Pace", desc: "Builds solid coding skills alongside academics." },
  { id: "2hrs", title: "2 hrs / day", tag: "Hardcore SDE Pace", desc: "Fast-tracks LeetCode, GitHub & hackathons." },
];

const interestsList = [
  { id: "web", label: "Full-Stack Web Dev", tag: "High Demand" },
  { id: "ai", label: "AI & Machine Learning", tag: "Trending" },
  { id: "app", label: "Mobile App Dev (Flutter/React Native)", tag: "Product" },
  { id: "hackathons", label: "Hackathons & Tech Contests", tag: "Events" },
  { id: "electronics", label: "Embedded Systems & IoT", tag: "Hardware" },
  { id: "opensource", label: "Open Source & Systems", tag: "Community" },
];

export default function FreshersOnboarding() {
  const [step, setStep] = useState(1);
  const totalSteps = 9;

  // Form States (9 Questions)
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("cse");
  const [semester, setSemester] = useState<number>(1);
  const [evalType, setEvalType] = useState("vtu");
  const [careerGoal, setCareerGoal] = useState("sde");
  const [progLevel, setProgLevel] = useState("beginner");
  const [prefLang, setPrefLang] = useState("english");
  const [studyTime, setStudyTime] = useState("30mins");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["web", "ai"]);

  const [isFinished, setIsFinished] = useState(false);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progressPercentage = Math.round((step / totalSteps) * 100);

  return (
    <main className="min-h-screen bg-[#08090e] text-[#f3f4f6] selection:bg-purple-500/30 selection:text-purple-200 flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Glow Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[450px] bg-radial-glow opacity-80" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      {/* TOP HEADER & DUOLINGO-STYLE PROGRESS BAR */}
      <header className="relative z-10 border-b border-white/10 bg-[#08090e]/80 backdrop-blur-xl px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={step === 1 || isFinished}
            className={`p-1.5 rounded-lg border transition ${
              step === 1 || isFinished
                ? "opacity-20 border-transparent text-gray-500 cursor-not-allowed"
                : "border-white/10 text-gray-300 hover:bg-white/10 cursor-pointer"
            }`}
          >
            <ChevronLeft className="size-5" />
          </button>

          {!isFinished && (
            <div className="flex-1 max-w-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                <span className="text-purple-400">60s Quick Setup</span>
                <span>{step} of {totalSteps}</span>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 shadow-sm shadow-purple-500/50"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20 text-xs font-bold">
            <Flame className="size-3.5" />
            <span>+100 XP</span>
          </div>
        </div>
      </header>

      {/* MAIN ONBOARDING CARD CONTAINER */}
      <div className="relative z-10 mx-auto w-full max-w-xl px-4 py-6 sm:px-6 flex-1 flex flex-col justify-center">
        {isFinished ? (
          /* COMPLETION & MISSION REVEAL SCREEN */
          <div className="rounded-3xl border border-purple-500/40 bg-gradient-to-b from-[#111322] to-[#08090e] p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-pulse-glow">
            <div className="size-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/40">
              <Rocket className="size-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Personalization 100% Ready
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome to Mission Control!
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xs mx-auto">
                We generated your custom 1st-year workspace for {college || "your Karnataka college"}.
              </p>
            </div>

            {/* Generated Profile Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-gray-400">Personalized Profile</span>
                <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {evalType} Scheme
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-300">
                <div>
                  <span className="text-gray-500 block">Branch & Sem</span>
                  <strong className="text-white">{branch.toUpperCase()} • Sem {semester}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Daily Study Goal</span>
                  <strong className="text-cyan-400">{studyTimeOptions.find(s => s.id === studyTime)?.title}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Target Career</span>
                  <strong className="text-purple-400">{careerGoals.find(c => c.id === careerGoal)?.title}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Language</span>
                  <strong className="text-amber-400">{languagesList.find(l => l.id === prefLang)?.label}</strong>
                </div>
              </div>
            </div>

            <Link
              href="/#demo"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition"
            >
              Enter Mission Control
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          /* 9 QUESTION CARDS */
          <div className="space-y-6">
            {/* Q1: COLLEGE */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Question 1 of 9</span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">Which college did you join?</h1>
                  <p className="text-xs text-gray-400">Unlocks campus-specific senior playbooks and viva cheat sheets.</p>
                </div>
                <select
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3.5 text-sm text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Search / Choose Karnataka College...</option>
                  {collegesList.map((col, idx) => (
                    <option key={idx} value={col} className="bg-gray-900 text-gray-200">
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Q2: BRANCH */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Question 2 of 9</span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">What is your engineering branch?</h1>
                  <p className="text-xs text-gray-400">Maps your exact subject modules and lab requirements.</p>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {branchesList.map((b) => {
                    const isSelected = branch === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setBranch(b.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-purple-600/20 border-purple-500 text-white font-bold"
                            : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="text-xs sm:text-sm">{b.label}</span>
                        {isSelected && <Check className="size-4 text-purple-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Q3: SEMESTER */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Question 3 of 9</span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">Which semester are you in?</h1>
                  <p className="text-xs text-gray-400">Ensures your active syllabus matches your current semester.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {semesterList.map((s) => {
                    const isSelected = semester === s.sem;
                    return (
                      <div
                        key={s.sem}
                        onClick={() => setSemester(s.sem)}
                        className={`p-3 rounded-xl border transition cursor-pointer space-y-1 ${
                          isSelected
                            ? "bg-purple-600/20 border-purple-500 text-white"
                            : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="text-xs font-bold block text-white">{s.label}</span>
                        <span className="text-[10px] text-gray-400 block">{s.badge}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Q4: VTU OR AUTONOMOUS */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Question 4 of 9</span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">Is your college VTU or Autonomous?</h1>
                  <p className="text-xs text-gray-400">Sets up your exact CIE evaluation and 75% attendance radar.</p>
                </div>
                <div className="space-y-2.5">
                  {evaluationTypes.map((t) => {
                    const isSelected = evalType === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setEvalType(t.id)}
                        className={`p-4 rounded-xl border transition cursor-pointer flex items-start justify-between ${
                          isSelected
                            ? "bg-purple-600/20 border-purple-500 text-white"
                            : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div>
                          <h3 className="text-sm font-bold text-white">{t.title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="size-5 text-purple-400 shrink-0 mt-0.5" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Q5: CAREER GOAL */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Question 5 of 9</span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">What is your primary career goal?</h1>
                  <p className="text-xs text-gray-400">Tailors your engineering skill roadmap and interview tracks.</p>
                </div>
                <div className="space-y-2">
                  {careerGoals.map((cg) => {
                    const IconComp = cg.icon;
                    const isSelected = careerGoal === cg.id;
                    return (
                      <div
                        key={cg.id}
                        onClick={() => setCareerGoal(cg.id)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-purple-600/20 border-purple-500 text-white"
                            : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComp className={`size-5 ${isSelected ? "text-purple-400" : "text-gray-400"}`} />
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-white">{cg.title}</h3>
                            <p className="text-[11px] text-gray-400">{cg.desc}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="size-4 text-purple-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Q6: PROGRAMMING EXPERIENCE */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Question 6 of 9</span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">What is your programming level?</h1>
                  <p className="text-xs text-gray-400">Ensures we start you at the perfect skill baseline.</p>
                </div>
                <div className="space-y-2">
                  {programmingLevels.map((pl) => {
                    const isSelected = progLevel === pl.id;
                    return (
                      <div
                        key={pl.id}
                        onClick={() => setProgLevel(pl.id)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-purple-600/20 border-purple-500 text-white"
                            : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-white">{pl.title}</h3>
                          <p className="text-[11px] text-gray-400">{pl.desc}</p>
                        </div>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                          {pl.xp}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Q7: PREFERRED LANGUAGE */}
            {step === 7 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Question 7 of 9</span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">Preferred language for guidance?</h1>
                  <p className="text-xs text-gray-400">Choose your language for AI mentor explanations & senior notes.</p>
                </div>
                <div className="space-y-2.5">
                  {languagesList.map((lang) => {
                    const isSelected = prefLang === lang.id;
                    return (
                      <div
                        key={lang.id}
                        onClick={() => setPrefLang(lang.id)}
                        className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-purple-600/20 border-purple-500 text-white font-bold"
                            : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Globe className={`size-5 ${isSelected ? "text-purple-400" : "text-gray-400"}`} />
                          <span className="text-sm">{lang.native}</span>
                        </div>
                        {isSelected && <Check className="size-4 text-purple-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Q8: DAILY STUDY TIME */}
            {step === 8 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Question 8 of 9</span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">Daily study time commitment?</h1>
                  <p className="text-xs text-gray-400">Configures your daily Mission Control task size.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {studyTimeOptions.map((st) => {
                    const isSelected = studyTime === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setStudyTime(st.id)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer space-y-1 ${
                          isSelected
                            ? "bg-purple-600/20 border-purple-500 text-white"
                            : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="text-xs font-bold text-white block">{st.title}</span>
                        <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded inline-block">
                          {st.tag}
                        </span>
                        <p className="text-[11px] text-gray-400 leading-tight pt-1">{st.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Q9: INTERESTS */}
            {step === 9 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Question 9 of 9</span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">What tech domains excite you?</h1>
                  <p className="text-xs text-gray-400">Select 1 or more interests for hackathon teammate alerts.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {interestsList.map((intr) => {
                    const isSelected = selectedInterests.includes(intr.id);
                    return (
                      <div
                        key={intr.id}
                        onClick={() => toggleInterest(intr.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-purple-600/20 border-purple-500 text-white font-bold"
                            : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs block text-white">{intr.label}</span>
                          <span className="text-[10px] text-gray-400 block">{intr.tag}</span>
                        </div>
                        {isSelected && <Check className="size-4 text-purple-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CONTINUE BUTTON */}
            <div className="pt-4">
              <button
                onClick={handleNext}
                className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 cursor-pointer transition"
              >
                <span>{step === totalSteps ? "Generate Mission Control" : "Continue"}</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-[#06070a] py-3 text-center text-xs text-gray-500 px-4">
        CampusOS 60s Freshers Onboarding • Duolingo Momentum + Notion Calm
      </footer>
    </main>
  );
}
