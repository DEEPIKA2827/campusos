# `app/scholarships/page.tsx`

## Purpose of this file

`app/scholarships/page.tsx` is the **Student Financial Security & Scholarship Portal** component located at route `/scholarships`.

It exists to:
1. **Centralize Financial Aid Directory**: Aggregate state (SSP Karnataka), central (NSP), corporate (Reliance, Infosys), and trust (Sitaram Jindal) grants for engineering undergraduates.
2. **Offer Multi-Parametric Filtering**: Allow students to filter by family income limits, academic marks, category, gender (Women in Tech), and deadline urgency.
3. **Track Application Lifecycles**: Provide a lightweight Kanban application tracker (`Saved`, `Applied`, `Under Review`, `Awarded`).
4. **Display Verified Document Checklists**: Render modal checklists showing required documents (Income Certificate, PUC Marks Cards, Aadhaar) before opening official portals.

---

## Execution Flow

```mermaid
graph TD
    A[User Navigates to /scholarships] --> B[Next.js SSR Renders Header & Hero Grants Pool]
    B --> C[Client Hydrates with State: trackedScholarships, reminders, activeCategory]
    C --> D[Compute Kanban Tracker Counts: Saved, Applied, Under Review, Awarded]
    D --> E[Evaluate Dynamic Filter Matrix: Category + SearchQuery + Type + WomenOnly + Urgent]
    E --> F[Render Filtered Scholarship Cards List]
    F --> G{User Actions}
    G -- Toggle Reminder -- H[Update reminders Array & Show Toast]
    G -- Select Track Status -- I[Update trackedScholarships Object & Recalculate Kanban]
    G -- Click Docs Checklist -- J[Open Document Checklist Modal]
```

---

## Key Components & Imports

* `"use client"`: Enables client-side reactive filtering, state hooks (`useState`), modal popups, and notification toasts.
* `import Link from "next/link"`: Next.js routing to navigate back to workspace or forward to opportunities.
* `import { GraduationCap, Search, Clock, Award, Bookmark, ShieldCheck, Heart, FileText, ... } from "lucide-react"`: Vector icons representing grant badges, urgency timers, and verification indicators.

---

## State Architecture

| State Variable | Type | Initial Value | Description |
| :--- | :--- | :--- | :--- |
| `activeCategory` | `string` | `"all"` | Selected category tab (`all`, `government`, `private`, `women`, `merit`). |
| `searchQuery` | `string` | `""` | Search input query targeting title, provider name, or tags. |
| `typeFilter` | `string` | `"all"` | Filter by grant provider type (`all`, `government`, `private`). |
| `womenOnlyFilter` | `boolean` | `false` | Toggle to display female-targeted tech grants only. |
| `urgentOnly` | `boolean` | `false` | Toggle to display grants closing in less than 15 days. |
| `trackedScholarships` | `Record<string, Status>` | `{ s1: "applied", s2: "saved" }` | Map storing user application status per scholarship ID. |
| `reminders` | `string[]` | `["s1"]` | Array of scholarship IDs where deadline reminders are enabled. |
| `selectedDocChecklist` | `Scholarship \| null` | `null` | Active scholarship object displayed inside the document modal. |

---

## Detailed Code Walkthrough

### 1. Multi-Criteria Filter Engine
The filtering logic evaluates every item against 5 criteria in sequence:
```typescript
const filteredScholarships = scholarshipsData.filter((sch) => {
  if (activeCategory === "government" && sch.type !== "government") return false;
  if (activeCategory === "private" && sch.type !== "private") return false;
  if (activeCategory === "women" && !sch.isWomenOnly) return false;

  if (
    searchQuery &&
    !sch.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !sch.provider.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !sch.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  ) {
    return false;
  }

  if (typeFilter !== "all" && sch.type !== typeFilter) return false;
  if (womenOnlyFilter && !sch.isWomenOnly) return false;
  if (urgentOnly && !sch.isUrgent) return false;

  return true;
});
```

### 2. Application Tracker Summary Counter
Calculates live breakdown counts for the top Kanban overview widget:
```typescript
const trackerCounts = {
  saved: Object.values(trackedScholarships).filter((s) => s === "saved").length,
  applied: Object.values(trackedScholarships).filter((s) => s === "applied").length,
  review: Object.values(trackedScholarships).filter((s) => s === "review").length,
  awarded: Object.values(trackedScholarships).filter((s) => s === "awarded").length,
};
```

### 3. Security & Accessible External Links
All official portal buttons (SSP, NSP, Reliance, Infosys) open in new tabs securely:
```tsx
<a
  href={sch.portalUrl}
  target="_blank"
  rel="noopener noreferrer"
>
  Apply Official <ExternalLink className="size-3.5" />
</a>
```

---

## Technical Interview Questions & Concepts

### Q1: Why use `rel="noopener noreferrer"` on external link targets (`target="_blank"`)?
**Answer**: Prevent security vulnerabilities known as reverse tabnabbing, where the opened page gains access to the originating window object via `window.opener` and can redirect the user to a phishing website.

### Q2: How does the application tracker state preserve status without a database backend in this prototype?
**Answer**: The status dictionary `trackedScholarships` uses key-value mapping indexed by scholarship ID (`id: status`), allowing $O(1)$ state lookups and reactive Kanban counter recalculations upon user selection.

### Key Concepts
* **Declarative Filtering**: Chaining multiple boolean conditions to refine array rendering cleanly.
* **Controlled Select Elements**: Binding HTML `<select>` values to local state objects.
* **Modal Accessibility**: Using `backdrop-blur-sm` overlays with explicit close handlers (`X` button & state reset).
