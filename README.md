# 🛡️ VIGILANT IDE
### **Self-Healing Engineering Intelligence Platform**

Vigilant IDE is a next-generation, agent-driven development environment designed to eliminate "Dejavu Bugs"—issues that have occurred before but keep leaking back into production. By integrating the **Hindsight Cloud API**, Vigilant IDE cross-references your real-time code changes against historical incident post-mortems and architecture maps.

![Vigilant IDE UI](https://github.com/RedxHarshit/vigilantide/raw/main/public/preview.png) *(Placeholder: Add your screenshot here)*

---

## 🚀 Key Features

### ⚡ **Autonomous Healing Strategy**
When the agent detects a pattern that mirrors a known production failure, a **floating "Healing Strategy" popover** appears directly over the editor. It proposes an architecture-safe patch that you can deploy with a single click.

### 🧠 **Hindsight Cloud Integration**
Vigilant IDE is powered by a bi-directional sync with the **Hindsight Vector Database**. It doesn't just "guess"; it remembers:
- **Incident Vault**: Recalls past bugs, PR comments, and post-mortems.
- **Architecture Heatmap**: Visualizes dependency risks and data governance standards in real-time.

### 🎨 **Cyberpunk-Adjacent Aesthetics**
Designed for high-focus engineering, the interface features a deep-navy "Cyberpunk-Vercel" aesthetic with glassmorphism details, glowing state indicators, and a minimalistic horizontal navigation.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (via `@monaco-editor/react`)
- **Intelligence Engine**: [Hindsight Cloud API](https://hindsight.vectorize.io/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏁 Getting Started

### 1. Requirements
Ensure you have an active **Hindsight API Key**. You can obtain one by signing up at [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io).

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/RedxHarshit/vigilantide.git

# Navigate to directory
cd vigilantide

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_HINDSIGHT_URL=https://api.hindsight.vectorize.io
VITE_HINDSIGHT_API_KEY=your_hindsight_api_key_here
```

### 4. Launch
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to see your self-healing workspace in action.

---

## 🛡️ The Agentic Loop

1. **SEARCHING**: Queries the `incident-memory` bank for historical patterns.
2. **ANALYZING**: Maps the current code to the `architecture-map` for dependency safety.
3. **PROPOSING**: Generates a deep-reasoned "Healing Strategy" patch.
4. **REFLECTING**: Self-verifies the fix against known security standards (SQLi, PCI, etc).
5. **COMPLETE**: Injects the solution directly into the IDE.

---

## 📜 License
Distributable under the MIT License. See `LICENSE` for more information.

---
**Built for the Engineering Intelligence Era.**
