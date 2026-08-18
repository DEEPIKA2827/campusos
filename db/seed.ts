/**
 * @file db/seed.ts
 * @description Master Seed Script for CampusOS.
 * @purpose Populates the database with realistic, synthetic demo data across all 21 tables.
 * @order Strictly respects topological dependency order (Level 0 through Level 4).
 */

import { db, schema } from "@/lib/db";
import { Logger } from "@/lib/logger";

export async function runSeed(): Promise<void> {
  if (!db) {
    throw new Error(
      "Cannot run database seed: Database client is not initialized. Please ensure DATABASE_URL is properly configured in your environment."
    );
  }

  Logger.info("Starting CampusOS Master Seed Pipeline across 21 tables...");

  try {
    // =========================================================================
    // LEVEL 0: Root Master Tables (0 Foreign Keys)
    // =========================================================================
    Logger.info("Seeding Level 0: Master Tables (users, colleges, scholarships, roadmaps, opportunities)...");

    // 1. Users (5 Demo Accounts: 1 Admin, 1 Faculty, 3 Engineering Students)
    const seededUsers = await db
      .insert(schema.users)
      .values([
        {
          email: "admin@campusos.internal",
          passwordHash: "$2a$12$demo_admin_hash_for_testing_purposes_only",
          role: "admin",
        },
        {
          email: "faculty.cs@rvce.edu.in",
          passwordHash: "$2a$12$demo_faculty_hash_for_testing_purposes_only",
          role: "faculty",
        },
        {
          email: "student.rahul@campusos.demo",
          passwordHash: "$2a$12$demo_student_hash_for_testing_purposes_only",
          role: "student",
        },
        {
          email: "student.ananya@campusos.demo",
          passwordHash: "$2a$12$demo_student_hash_for_testing_purposes_only",
          role: "student",
        },
        {
          email: "student.vikram@campusos.demo",
          passwordHash: "$2a$12$demo_student_hash_for_testing_purposes_only",
          role: "student",
        },
      ])
      .onConflictDoNothing()
      .returning();

    // 2. Colleges (4 Demo Engineering Colleges)
    const seededColleges = await db
      .insert(schema.colleges)
      .values([
        { collegeName: "RV College of Engineering (RVCE)", location: "Bengaluru, Karnataka" },
        { collegeName: "BMS College of Engineering (BMSCE)", location: "Bengaluru, Karnataka" },
        { collegeName: "PES University (PESU)", location: "Bengaluru, Karnataka" },
        { collegeName: "M.S. Ramaiah Institute of Technology (MSRIT)", location: "Bengaluru, Karnataka" },
      ])
      .onConflictDoNothing()
      .returning();

    // 3. Scholarships (4 Demo Government & Foundation Scholarships)
    const seededScholarships = await db
      .insert(schema.scholarships)
      .values([
        {
          scholarshipName: "SSP Post-Matric Scholarship (Karnataka)",
          description: "State Scholarship Portal financial assistance for eligible Karnataka undergraduate students.",
          eligibility: "Karnataka domicile, parental income < 2.5 LPA, enrolled in recognized degree.",
          applicationUrl: "https://ssp.postmatric.karnataka.gov.in",
          deadline: "2026-10-31",
        },
        {
          scholarshipName: "Vidyasiri E-Pass Scheme",
          description: "Hostel and fee reimbursement support for backward classes and minority students in Karnataka.",
          eligibility: "OBC / Minority students studying in accredited technical institutions.",
          applicationUrl: "https://karepass.cgg.gov.in",
          deadline: "2026-11-15",
        },
        {
          scholarshipName: "National Scholarship Portal (NSP) Merit-cum-Means",
          description: "Central government merit-cum-means financial grant for professional and technical education.",
          eligibility: "Minimum 50% marks in previous final exam, family income < 2.5 LPA.",
          applicationUrl: "https://scholarships.gov.in",
          deadline: "2026-12-01",
        },
        {
          scholarshipName: "Foundation for Excellence (FFE) Engineering Grant",
          description: "Need-cum-merit financial support for exceptional first-year engineering students.",
          eligibility: "Top ranks in KCET/JEE with demonstrated financial need.",
          applicationUrl: "https://ffe.org",
          deadline: "2026-09-30",
        },
      ])
      .onConflictDoNothing()
      .returning();

    // 4. Roadmaps (3 Demo Career Roadmaps)
    const seededRoadmaps = await db
      .insert(schema.roadmaps)
      .values([
        {
          title: "Full-Stack Web Developer Roadmap",
          description: "Step-by-step curriculum for modern web engineering (TypeScript, React, Next.js, Node.js, PostgreSQL).",
          career: "Full Stack Engineer",
        },
        {
          title: "AI & Machine Learning Engineer Roadmap",
          description: "Foundations of linear algebra, python data stack, deep learning, PyTorch, and LLM application development.",
          career: "AI / ML Engineer",
        },
        {
          title: "Cloud Native & DevOps Engineer Roadmap",
          description: "Linux systems, Docker containerization, Kubernetes orchestration, CI/CD pipelines, and cloud platforms.",
          career: "DevOps Engineer",
        },
      ])
      .onConflictDoNothing()
      .returning();

    // 5. Opportunities (5 Demo Tech Internships & Hackathons)
    const seededOpportunities = await db
      .insert(schema.opportunities)
      .values([
        {
          title: "Software Engineering Intern (Summer 2027)",
          company: "CloudTech Solutions Bengaluru",
          description: "Frontend & backend engineering internship for 3rd/4th year undergraduate engineering students.",
          applicationUrl: "https://careers.cloudtech-demo.internal/jobs/101",
          deadline: "2026-11-30",
        },
        {
          title: "Karnataka State Smart Campus Hackathon 2026",
          company: "Department of Higher Education Karnataka",
          description: "48-hour state-wide hackathon focusing on AI for public university administration and student tools.",
          applicationUrl: "https://hackathon.karnataka-demo.internal",
          deadline: "2026-09-15",
        },
        {
          title: "Data Science Research Fellow",
          company: "AI Labs Innovation Center",
          description: "Part-time research fellowship analyzing educational learning graphs and predictive attendance models.",
          applicationUrl: "https://ailabs-demo.internal/fellowships",
          deadline: "2026-10-15",
        },
        {
          title: "Backend Engineering Trainee (Go / Node.js)",
          company: "FinFlow Technologies",
          description: "6-month paid industrial training on high-throughput distributed transaction systems.",
          applicationUrl: "https://finflow-demo.internal/careers",
          deadline: "2026-12-15",
        },
        {
          title: "Google Developer Student Clubs Ideathon",
          company: "GDSC Karnataka Chapter",
          description: "Ideation sprint for high-impact sustainable open-source software solutions.",
          applicationUrl: "https://gdsc-karnataka-demo.internal",
          deadline: "2026-09-20",
        },
      ])
      .onConflictDoNothing()
      .returning();

    // Fetch master records if returning was empty due to existing conflicts
    const allUsers = seededUsers.length > 0 ? seededUsers : await db.select().from(schema.users);
    const allColleges = seededColleges.length > 0 ? seededColleges : await db.select().from(schema.colleges);
    const allScholarships = seededScholarships.length > 0 ? seededScholarships : await db.select().from(schema.scholarships);
    const allRoadmaps = seededRoadmaps.length > 0 ? seededRoadmaps : await db.select().from(schema.roadmaps);
    const allOpportunities = seededOpportunities.length > 0 ? seededOpportunities : await db.select().from(schema.opportunities);

    // =========================================================================
    // LEVEL 1: First-Tier Dependencies
    // =========================================================================
    Logger.info("Seeding Level 1: Academic Schemes, Settings, Chat Threads, Roadmap Nodes, Bookmarks...");

    // 6. Academic Schemes (Linked to Colleges)
    const seededSchemes = await db
      .insert(schema.academicSchemes)
      .values([
        {
          collegeId: allColleges[0].collegeId,
          schemeName: "VTU 2022 Scheme (Autonomous Framework)",
          academicYear: "2022-2026",
        },
        {
          collegeId: allColleges[1].collegeId,
          schemeName: "BMSCE Autonomous Curriculum 2023",
          academicYear: "2023-2027",
        },
      ])
      .onConflictDoNothing()
      .returning();

    const allSchemes = seededSchemes.length > 0 ? seededSchemes : await db.select().from(schema.academicSchemes);

    // 7. Student Settings (Linked to Users)
    for (const u of allUsers) {
      await db
        .insert(schema.studentSettings)
        .values({
          userId: u.userId,
          notificationEnabled: true,
          theme: "system",
          language: "en",
        })
        .onConflictDoNothing();
    }

    // 8. Chat Threads (Linked to Users)
    const studentUser = allUsers.find((u) => u.role === "student") || allUsers[0];
    const seededThreads = await db
      .insert(schema.chatThreads)
      .values([
        {
          userId: studentUser.userId,
          title: "Exam Preparation Strategy for VTU DBMS",
        },
        {
          userId: studentUser.userId,
          title: "Data Structures & Algorithms Roadmap Doubts",
        },
      ])
      .onConflictDoNothing()
      .returning();

    const allThreads = seededThreads.length > 0 ? seededThreads : await db.select().from(schema.chatThreads);

    // 9. Roadmap Nodes (Linked to Roadmaps)
    const webRoadmap = allRoadmaps[0];
    const seededNodes = await db
      .insert(schema.roadmapNodes)
      .values([
        { roadmapId: webRoadmap.roadmapId, sequenceNo: 1, title: "Internet & HTTP Fundamentals", description: "DNS, TCP/IP, HTTP/HTTPS methods, headers, and request lifecycle." },
        { roadmapId: webRoadmap.roadmapId, sequenceNo: 2, title: "Modern HTML5 & Semantic Elements", description: "Accessibility, SEO best practices, and document structure." },
        { roadmapId: webRoadmap.roadmapId, sequenceNo: 3, title: "CSS3, Flexbox & Responsive Layouts", description: "Grid, Flexbox, CSS Variables, and Mobile-First responsive styling." },
        { roadmapId: webRoadmap.roadmapId, sequenceNo: 4, title: "JavaScript & TypeScript Mastery", description: "Async/await, closures, prototypes, TypeScript interfaces and types." },
        { roadmapId: webRoadmap.roadmapId, sequenceNo: 5, title: "React & Next.js Architecture", description: "Hooks, server components, routing, data fetching, and state management." },
        { roadmapId: webRoadmap.roadmapId, sequenceNo: 6, title: "Relational Databases & Drizzle ORM", description: "PostgreSQL schema design, normalization, indexing, and migrations." },
      ])
      .onConflictDoNothing()
      .returning();

    const allNodes = seededNodes.length > 0 ? seededNodes : await db.select().from(schema.roadmapNodes);

    // 10. Student Scholarship Bookmarks
    if (allScholarships.length > 0) {
      await db
        .insert(schema.studentScholarshipBookmarks)
        .values([
          { userId: studentUser.userId, scholarshipId: allScholarships[0].scholarshipId },
          { userId: studentUser.userId, scholarshipId: allScholarships[1].scholarshipId },
        ])
        .onConflictDoNothing();
    }

    // 11. Student Opportunities Tracking
    if (allOpportunities.length > 0) {
      await db
        .insert(schema.studentOpportunities)
        .values([
          { userId: studentUser.userId, opportunityId: allOpportunities[0].opportunityId, status: "applied" },
          { userId: studentUser.userId, opportunityId: allOpportunities[1].opportunityId, status: "saved" },
        ])
        .onConflictDoNothing();
    }

    // =========================================================================
    // LEVEL 2: Second-Tier Dependencies
    // =========================================================================
    Logger.info("Seeding Level 2: Courses, Chat Messages, Student Roadmap Progress...");

    // 12. Courses (Linked to Academic Schemes)
    const seededCourses = await db
      .insert(schema.courses)
      .values([
        {
          schemeId: allSchemes[0].schemeId,
          courseName: "Data Structures and Applications",
          courseCode: "21CS32",
        },
        {
          schemeId: allSchemes[0].schemeId,
          courseName: "Database Management Systems",
          courseCode: "21CS42",
        },
        {
          schemeId: allSchemes[0].schemeId,
          courseName: "Operating Systems",
          courseCode: "21CS43",
        },
        {
          schemeId: allSchemes[0].schemeId,
          courseName: "Computer Networks",
          courseCode: "21CS52",
        },
      ])
      .onConflictDoNothing()
      .returning();

    const allCourses = seededCourses.length > 0 ? seededCourses : await db.select().from(schema.courses);

    // 13. Chat Messages (Linked to Chat Threads)
    if (allThreads.length > 0) {
      await db
        .insert(schema.chatMessages)
        .values([
          {
            chatId: allThreads[0].chatId,
            senderType: "user",
            message: "How should I structure my study plan for VTU 21CS42 DBMS Module 2 (SQL & Normalization)?",
          },
          {
            chatId: allThreads[0].chatId,
            senderType: "assistant",
            message: "For Module 2, focus on: 1. Functional Dependencies and 2NF/3NF/BCNF decomposition rules. 2. Practical SQL DDL/DML queries with JOINs and aggregate functions. 3. Reviewing previous year questions on lossless join decomposition.",
          },
        ])
        .onConflictDoNothing();
    }

    // 14. Student Roadmap Progress
    if (allNodes.length >= 2) {
      await db
        .insert(schema.studentRoadmapProgress)
        .values([
          {
            userId: studentUser.userId,
            roadmapId: webRoadmap.roadmapId,
            nodeId: allNodes[0].nodeId,
            status: "completed",
            completedAt: new Date().toISOString(),
          },
          {
            userId: studentUser.userId,
            roadmapId: webRoadmap.roadmapId,
            nodeId: allNodes[1].nodeId,
            status: "in_progress",
          },
        ])
        .onConflictDoNothing();
    }

    // =========================================================================
    // LEVEL 3: Third-Tier Dependencies (Profiles, Logs, Summaries, Assessments)
    // =========================================================================
    Logger.info("Seeding Level 3: Student Profiles, Attendance Logs/Summaries, CIE Assessments, Question Banks...");

    // 15. Student Profiles (Linked to users, colleges, courses — STRICTLY NO scheme_id)
    const studentUsers = allUsers.filter((u) => u.role === "student");
    const demoProfiles = [
      {
        userId: studentUsers[0]?.userId || allUsers[2].userId,
        firstName: "Rahul",
        lastName: "Sharma",
        collegeId: allColleges[0].collegeId,
        courseId: allCourses[0].courseId,
        semester: 4,
      },
      {
        userId: studentUsers[1]?.userId || allUsers[3].userId,
        firstName: "Ananya",
        lastName: "Rao",
        collegeId: allColleges[0].collegeId,
        courseId: allCourses[1].courseId,
        semester: 4,
      },
      {
        userId: studentUsers[2]?.userId || allUsers[4].userId,
        firstName: "Vikram",
        lastName: "Patil",
        collegeId: allColleges[1].collegeId,
        courseId: allCourses[2].courseId,
        semester: 6,
      },
    ];

    for (const p of demoProfiles) {
      await db.insert(schema.studentProfiles).values(p).onConflictDoNothing();
    }

    // 16. Attendance Logs (Daily entries)
    const primaryStudent = demoProfiles[0].userId;
    const dbmsCourse = allCourses[1].courseId;

    await db
      .insert(schema.attendanceLogs)
      .values([
        { userId: primaryStudent, courseId: dbmsCourse, attendanceDate: "2026-08-01", status: "present" },
        { userId: primaryStudent, courseId: dbmsCourse, attendanceDate: "2026-08-03", status: "present" },
        { userId: primaryStudent, courseId: dbmsCourse, attendanceDate: "2026-08-05", status: "absent" },
        { userId: primaryStudent, courseId: dbmsCourse, attendanceDate: "2026-08-08", status: "present" },
        { userId: primaryStudent, courseId: dbmsCourse, attendanceDate: "2026-08-10", status: "present" },
      ])
      .onConflictDoNothing();

    // 17. Attendance Summaries
    await db
      .insert(schema.attendanceSummaries)
      .values([
        {
          userId: primaryStudent,
          courseId: dbmsCourse,
          totalClasses: 25,
          attendedClasses: 22,
          attendancePercentage: "88.00",
        },
        {
          userId: primaryStudent,
          courseId: allCourses[0].courseId,
          totalClasses: 30,
          attendedClasses: 24,
          attendancePercentage: "80.00",
        },
      ])
      .onConflictDoNothing();

    // 18. CIE Assessments
    const seededCie = await db
      .insert(schema.cieAssessments)
      .values([
        { courseId: dbmsCourse, assessmentName: "Continuous Internal Evaluation (CIE-1)", assessmentDate: "2026-09-10", maxMarks: "50.00" },
        { courseId: dbmsCourse, assessmentName: "Continuous Internal Evaluation (CIE-2)", assessmentDate: "2026-11-05", maxMarks: "50.00" },
        { courseId: dbmsCourse, assessmentName: "Database Laboratory Practical Exam", assessmentDate: "2026-11-20", maxMarks: "25.00" },
      ])
      .onConflictDoNothing()
      .returning();

    const allCie = seededCie.length > 0 ? seededCie : await db.select().from(schema.cieAssessments);

    // 19. PYQs (Previous-Year Questions)
    await db
      .insert(schema.pyqs)
      .values([
        {
          courseId: dbmsCourse,
          question: "Explain the three-schema architecture of DBMS and differentiate between logical and physical data independence.",
          examYear: 2024,
          marks: "10.00",
          difficulty: "medium",
        },
        {
          courseId: dbmsCourse,
          question: "What is BCNF? How does it differ from 3NF? Illustrate with a relation schema that satisfies 3NF but not BCNF.",
          examYear: 2023,
          marks: "10.00",
          difficulty: "hard",
        },
        {
          courseId: dbmsCourse,
          question: "Define primary key, candidate key, foreign key, and super key with appropriate examples.",
          examYear: 2024,
          marks: "5.00",
          difficulty: "easy",
        },
      ])
      .onConflictDoNothing();

    // 20. Viva Questions
    await db
      .insert(schema.vivaQuestions)
      .values([
        {
          courseId: dbmsCourse,
          question: "What is the difference between TRUNCATE, DROP, and DELETE statements in SQL?",
          difficulty: "easy",
        },
        {
          courseId: dbmsCourse,
          question: "Why are B+ trees preferred over B trees for disk-based database indexing?",
          difficulty: "medium",
        },
        {
          courseId: dbmsCourse,
          question: "What are ACID properties? How does Write-Ahead Logging (WAL) guarantee durability?",
          difficulty: "hard",
        },
      ])
      .onConflictDoNothing();

    // =========================================================================
    // LEVEL 4: Fourth-Tier Dependencies (CIE Marks)
    // =========================================================================
    Logger.info("Seeding Level 4: Student CIE Marks...");

    // 21. Student CIE Marks
    if (allCie.length > 0) {
      await db
        .insert(schema.studentCieMarks)
        .values([
          {
            userId: primaryStudent,
            cieId: allCie[0].cieId,
            marksObtained: "44.50",
          },
          {
            userId: primaryStudent,
            cieId: allCie[2].cieId,
            marksObtained: "23.00",
          },
        ])
        .onConflictDoNothing();
    }

    Logger.info("✅ CampusOS Master Seed Pipeline completed successfully across all 21 tables!");
  } catch (error) {
    Logger.error("Failed during Master Seed Pipeline execution", error);
    throw error;
  }
}
