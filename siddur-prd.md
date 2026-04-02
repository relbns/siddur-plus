# 📘 PRD v2 – Ultra Detailed

## Sidur+ (PWA Jewish Companion App)

---

# 1. Product Definition

## 1.1 Vision

A **mobile-first, offline-first, frontend-only Progressive Web App** that acts as a **complete Jewish daily companion**, combining:

* Prayer (Sidur)
* Tehillim (Psalms)
* Context-aware Halacha
* Torah reading
* Jewish calendar logic
* Utilities (compass)

All delivered with **native mobile UX** and **zero backend dependency**.

---

## 1.2 Core Principles

* **Offline-first**
* **Data-driven (no hardcoded UI logic)**
* **Context-aware engine**
* **RTL-first Hebrew UX**
* **Text-based rendering (no images for content)**
* **Lightweight bundles**
* **Native-feel interactions**

---

# 2. System Architecture Overview

## 2.1 High-Level Architecture

```
App Shell (React PWA)
│
├── UI Layer (Screens + Components)
├── State Layer (Zustand)
├── Context Engine (Calendar + Logic)
├── Content Engine (Data + Conditions)
├── Storage Layer (IndexedDB)
├── Search Engine (MiniSearch/Fuse)
└── Service Worker (Offline)
```

---

## 2.2 Module Separation

```
features/
  prayer/
  tehillim/
  halacha/
  torah/
  calendar/
  compass/
  search/
  settings/

core/
  context-engine/
  content-engine/
  storage/
  navigation/
```

---

# 3. Context Engine (CRITICAL)

## 3.1 Purpose

Central engine that determines **what content is relevant** at any given moment.

---

## 3.2 Inputs

```
GregorianDate
UserLocation (lat/lng optional)
UserSettings:
  - nusach
  - region (Israel / Diaspora)
  - minhag flags
```

---

## 3.3 Derived State (Context Object)

```
Context {
  hebrewDate
  dayOfWeek
  isShabbat
  isYomTov
  isCholHamoed
  isFastDay
  isRoshChodesh
  isChanukah
  isPurim
  isPesach
  isSefiratHaomer
  isErevShabbat
  isErevYomTov

  parasha
  torahReadingType

  tachanunAllowed
  hallelType
  tefillinAllowed

  region
  nusach
}
```

---

## 3.4 Responsibilities

* Compute Hebrew date
* Identify holiday/moad
* Determine prayer variations
* Determine halachic flags
* Provide input to all modules

---

## 3.5 API

```
getContext(date?: Date, settings: UserSettings): Context
```

---

# 4. Content Engine

## 4.1 Purpose

Render dynamic content based on **conditions + context**.

---

## 4.2 Content Model

### Core Rule:

👉 UI never decides logic
👉 Content + conditions decide rendering

---

## 4.3 Base Schema

```
ContentNode {
  id
  type: "text" | "header" | "instruction"
  content
  conditions?: Condition[]
}
```

---

## 4.4 Condition Model

```
Condition {
  type:
    - "holiday"
    - "dayOfWeek"
    - "isShabbat"
    - "tachanun"
    - "nusach"
    - "region"

  operator: "equals" | "includes" | "not"

  value: any
}
```

---

## 4.5 Example

```
{
  type: "text",
  content: "תחנון",
  conditions: [
    { type: "tachanun", operator: "equals", value: true }
  ]
}
```

---

## 4.6 Rendering Algorithm

```
for each node:
  if no conditions → render
  else:
    evaluate conditions against Context
    if true → render
    else → skip
```

---

# 5. Prayer System

## 5.1 Structure

```
PrayerDocument {
  id
  title
  category
  sections: Section[]
}
```

---

## 5.2 Section

```
Section {
  id
  title
  nodes: ContentNode[]
}
```

---

## 5.3 Features

* Dynamic inclusion/exclusion of sections
* Scroll position persistence
* Section navigation
* Bookmark support

---

## 5.4 Example Flow

User opens Shacharit →
Context engine evaluates →
Content engine filters →
Rendered prayer matches exact day rules

---

# 6. Tehillim System

## 6.1 Data

```
TehillimChapter {
  chapterNumber
  verses: string[]
}
```

---

## 6.2 Plans

```
TehillimPlan {
  id
  type: "monthly" | "weekly" | "custom"
  mapping: {
    [day]: chapterRange[]
  }
}
```

---

## 6.3 Features

* Resume last chapter
* Save favorites
* Track progress (optional)
* Multiple reading modes

---

## 6.4 UI Modes

* Daily mode
* Explore mode
* Quick access mode

---

# 7. Halacha System

## 7.1 Types

```
HalachaItem {
  id
  title
  summary
  content
  tags
  conditions
}
```

---

## 7.2 Categories

* Daily context
* Holiday-specific
* Topic-based
* Tools (e.g., koshering)

---

## 7.3 Rendering

* Filter by context
* Prioritize relevant items
* Display summary first

---

# 8. Calendar System

## 8.1 Responsibilities

* Convert Gregorian → Hebrew
* Identify holidays
* Compute Torah readings

---

## 8.2 Approach

* Precomputed JSON OR lightweight algorithm
* Avoid heavy libs if possible

---

# 9. Navigation System

## 9.1 Structure

* Bottom tabs:

  * Today
  * Sidur
  * Tehillim
  * Halacha
  * More

* Drawer:

  * Full hierarchy

---

## 9.2 State Rules

* Preserve scroll state
* Restore last screen
* Fast transitions

---

# 10. State Management

## 10.1 Zustand Stores

```
useAppStore
useSettingsStore
useContextStore
usePrayerStore
useTehillimStore
useHalachaStore
```

---

## 10.2 Persistence

* IndexedDB for:

  * settings
  * bookmarks
  * last positions
  * cached content

---

# 11. Search System

## 11.1 Scope

* Prayer text
* Tehillim
* Halacha

---

## 11.2 Features

* Hebrew normalization
* Nikud stripping
* Fuzzy matching

---

# 12. Offline Strategy

## 12.1 Service Worker

* Cache app shell
* Cache content bundles

---

## 12.2 Data Strategy

* Lazy load content
* Store locally
* Version content

---

# 13. Performance Strategy

* Code splitting per module
* Lazy load heavy content
* Avoid large libraries
* Use text, not images
* SVG icons only

---

# 14. UX Specifications

## 14.1 Native Feel

* Instant transitions
* Large touch areas
* Minimal chrome in reading mode
* Smooth scroll

---

## 14.2 Reading Mode

* Sticky header
* Adjustable font
* No distractions

---

# 15. MVP Breakdown

## Phase 1

* Core app shell
* Context engine (basic)
* Prayer (daily)
* Tehillim (basic + daily)
* Halacha (basic)
* Settings
* Offline

---

## Phase 2

* Holidays
* Torah readings
* Compass
* Advanced context logic

---

## Phase 3

* Full nusach support
* Expanded halacha
* Advanced personalization

---

# 16. Risks

* Calendar complexity
* Halachic correctness
* Bundle size
* Device API limitations

---

# 17. Success Criteria

* Fast load
* Offline usability
* Daily engagement
* Smooth UX

---

# 18. Implementation Rule (IMPORTANT)

## MUST FOLLOW

* ❌ No logic in UI
* ✅ All logic via Context + Content Engine
* ❌ No static hardcoded prayer variants
* ✅ Everything condition-driven

---

# END OF PRD
