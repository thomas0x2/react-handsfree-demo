# Hands-Free UI: Multimodal Web Interface for Touchless Interaction

🚀 Prototype
🏁 Track: Human–Computer Interfaces  
📜 License: MIT

---

## 🧠 About

This project explores the future of touchless interaction by combining **hand gestures**, **voice commands**, and an **adaptive user interface** — all built using modern web technologies. It aims to provide accessible, private, and intuitive control for users in sterile, public, or accessibility-first contexts.

---

## ✨ Features

- 🔍 **Gesture Recognition** (5+ gestures) — powered by TensorFlow.js or MediaPipe
- 🎙️ **Voice Commands** (10+ intents) — via Web Speech API
- 🧩 **Context-Aware UI** — adapts layout based on user proximity and ambient light
- 🧪 **Live Calibration Tool** — lets users teach new gestures and commands in-browser
- 📱 PWA & mobile support

---

## 🛠️ Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Frontend     | Next.js 14 (App Router) + React 18 + Tailwind |
| Backend      | Firebase (Auth, Firestore, Cloud Functions)   |
| AI / ML      | TensorFlow.js / MediaPipe (on-device)         |
| Voice Input  | Web Speech API                                |
| Deployment   | Vercel or Firebase Hosting                    |

---

## 🚧 Getting Started

```bash
git clone https://github.com/your-username/handsfree-ui
cd handsfree-ui
pnpm install
pnpm dev
