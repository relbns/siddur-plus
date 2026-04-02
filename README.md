# Siddur+ (סידור+) 📖

![Status](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![PWA](https://img.shields.io/badge/PWA-Optimized-5A0FC8?logo=pwa)
![License](https://img.shields.io/badge/License-MIT-gray)

**Siddur+** is a modern, beautifully crafted, offline-first Progressive Web App (PWA) designed for seamless prayer, study, and daily Jewish living. 

With dynamic contextual features, a lightning-fast universal search engine, and a complete offline database, Siddur+ ensures that you always have access to your daily spiritual needs without requiring a network connection.

---

## ✨ Key Features

*   **⚡ Offline-First Architecture**: Built as a true PWA, the entire database (Prayers, 150 Tehillim Chapters, Halachot) is indexed and cached locally on your device for zero-latency access anywhere.
*   **🔍 Smart Universal Search**: Powered by `MiniSearch`, our custom search engine strips *Nikud* (Hebrew vowels) on the fly, allowing you to search words natively (e.g., searching "ברוך" perfectly matches "בָּרוּךְ").
*   **📅 Contextual Halacha Engine**: A smart rule engine that dynamically surfaces relevant daily *Halachot* based on the Jewish calendar (e.g., Sefirat HaOmer, Erev Shabbat, Pesach prohibitions).
*   **📖 Complete Tehillim Library**: 150 chapters of Psalms natively integrated with reading tracking, bookmarked states, and dedicated daily tabs.
*   **🧭 Zmanim & Compass**: Integrates seamlessly with the Hebcal engine to display accurate Zmanim, active Parashat HaShavua, and a smart Jerusalem Compass.
*   **🌙 Modern UI/UX**: Features high-contrast dark/light modes, customizable prayer fonts, fluid animations, and a rich, color-calibrated design system based on premium Hebrew typography (*Frank Ruhl Libre* and *Noto Sans Hebrew*).

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or newer)
*   [npm](https://www.npmjs.com/) (v9 or newer)

### Installation
1.  **Clone the repository:**
    ```bash
    git clone git@github.com:relbns/siddur-plus.git
    cd siddur-plus
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```

4.  **Fetch Live Content (Optional):**
    To refresh the offline JSON dataset from the Sefaria API:
    ```bash
    pnpm build:content
    ```

---

## 🛠️ Deployment

Siddur+ is configured for automatic deployments to GitHub Pages.

### Method 1: Automated (GitHub Actions)
A `.github/workflows/deploy.yml` workflow is included. Every push to the `master` or `main` branch will automatically build and deploy the app to your `gh-pages` environment.

### Method 2: Manual Script
If you prefer deploying manually from your terminal, execute the included deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📱 PWA Features
This app is fully optimized to be installed on mobile devices (iOS/Android):
1. Navigate to the hosted app URL in Safari or Chrome.
2. Tap **Share > Add to Home Screen** (iOS) or **Install App** (Android).
3. Launch Siddur+ from your home screen just like a native app!

---

## 🏗️ Technologies Used
*   **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Routing**: [React Router DOM (HashRouter)](https://reactrouter.com/) (For GH-Pages compatibility)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Search**: [MiniSearch](https://lucaongaro.eu/minisearch/)
*   **Calendar API**: [@hebcal/core](https://github.com/hebcal/hebcal-es6)
*   **Styling**: Pure modular CSS variables and high-performance flex/grid layouts.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/relbns/siddur-plus/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Made with ❤️ for the community.*
