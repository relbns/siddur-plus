<div align="center">
  <img src="public/pwa-512x512.png" alt="Siddur+ Logo" width="128" />
  <h1>Siddur+ (סידור+)</h1>
  <p><strong>A hyper-fast, offline-first, dynamic Jewish prayer Progressive Web App.</strong></p>
  
  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-success?style=for-the-badge&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
</div>

<br/>

Siddur+ is a modern approach to digital Jewish prayer and learning. Instead of serving static monolithic texts, Siddur+ features a **Predicate Rendering Engine** that dynamically evaluates halachic conditions (Zmanim, Holidays, Time of Day) entirely client-side to render the exact text required for that specific moment.

## ✨ Features

- **📶 100% Offline-First:** PWA powered by Workbox. After the first load, the app works seamlessly without an internet connection.
- **🧠 Predicate Engine:** Halachic logic decoupled from the UI. The engine calculates conditionals for *Tachanun*, *Ya'aleh Veyavo*, *Al HaNisim*, etc., using `@hebcal/core`.
- **📖 Dynamic Prayer Reader:** Automatic insertion/removal of relevant prayer sections with a distraction-free, session-locked reading experience.
- **✡️ Full Hebrew Localization:** Dates, Parashot, and holidays are fully formatted in Hebrew.
- **🎵 Configurable Texts:** Toggle *Nikud* (vowels) on/off effortlessly.
- **⚖️ Halachic Tools:**
  - Complete 13-point **Zmanim** calculator (from *Alot HaShachar* to *Tzeit HaKochavim*).
  - **Tefilat HaDerech** with integrated offline HTML5 Audio playback.
  - **Date Converter** with automatic Gematriya formatting.
  - Track **Tehillim** chapter progress directly to IndexedDB.
- **🌙 Prayer Modes:** "Keep Screen Awake" and "Silent Mode Reminder".

## 🛠 Tech Stack

- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **State Management:** Zustand
- **Routing:** React Router v6
- **Storage:** `localforage` (IndexedDB)
- **Jewish Calendar & Zmanim:** `@hebcal/core`

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd siddur
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`.*

4. **Build Content:**
   Fetch the latest texts from the Sefaria pipeline (requires internet):
   ```bash
   npm run build:content
   ```

5. **Build for Production:**
   ```bash
   npm run build
   npm run preview
   ```

## 🏗 Architecture Principles

- **Zero-Backend Dependency:** There is no server. All text artifacts are compiled into static HTTP JSON assets via a build script mapped to the Sefaria API.
- **Session Locking:** When a user enters a prayer reader, their *Halachic Context Snapshot* is frozen so that navigating the prayer midway through sunset doesn't violently alter the text.
- **Offline Zmanim:** Computed purely algorithmically on the user's device based on Geolocation coordinates. No API pings required.

---
*Built with modern web standards and deep respect for Halachic traditions.*
