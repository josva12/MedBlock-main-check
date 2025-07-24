# MedBlock AI Chatbot Plan

## 1. Core Problem & MVP Scope (The "What")

**Vision:**
A multimodal AI assistant for patients and doctors, supporting chat, Q&A, and health workflow automation.

**MVP Focus:**
- A secure, context-aware AI chat assistant for patients and doctors.
- Accessible via web UI (AIChatWidget, AIChatPage, AIPage) and `/api/v1/ai-chat/message` backend endpoint.
- Supports:
  - Natural language Q&A about health, appointments, insurance, and blockchain features.
  - (Optional) Image upload for basic triage or document analysis (simulated or real, depending on backend AI integration).
  - Contextual responses (e.g., "How do I get a quote?", "What are my recent appointments?", "How does blockchain protect my data?").
- Integrates with existing authentication and role-based access.
- All AI responses are logged for audit and improvement.

**Out of Scope for MVP:**
- Real-time clinical decision support.
- Direct access to patient medical records (beyond what is already available to the user).
- Automated prescription or diagnosis.
- Multimodal (image+text) deep analysis (beyond basic simulation).

---

## 1.1. Primary User, Use Case, and Modality

**Primary User:**
- Patients in Kenya (first audience)

**Primary Use Case:**
- Answering questions about nutrition, pregnancy, and common health concerns in Kenya (e.g., "What foods should I eat during pregnancy?", "How do I manage malaria symptoms?")

**Modality Focus:**
- **Option A: Text-only (Q&A chatbot)**
  - The MVP will focus on a text-based chatbot for health Q&A, accessible via web and mobile.
  - (Image support can be added in a future phase for medical professionals.)

---

## 1.2. Success Metrics (The "How")

**Accuracy Target:**
- For text Q&A: **90% of the AI's answers are rated as 'Accurate and Safe' by a Kenyan medical expert panel.**

**Impact Target:**
- **Help 1,000 unique users get reliable health information in the first 6 months.**
- **Reduce the time to get a trusted answer to a common health question by 50% compared to searching online.**

---

## 1.3. Initial Ethical & Regulatory Checklist (The "Responsibly")

**Data Consent:**
- All users must explicitly consent before their questions or chat data are used for AI training or improvement.
- Consent language will be shown at first use and in the chatbot UI, in compliance with Kenya's Data Protection Act.
- No images or sensitive data will be used for training without explicit, informed consent.

**Accountability:**
- The AI will always display a disclaimer: "This is not medical advice. For urgent or high-risk issues, consult a licensed healthcare provider."
- All high-risk or ambiguous queries will be flagged for review by a human medical expert before being used to improve the model.
- A named medical officer (or team) will be responsible for reviewing flagged outputs and user feedback.
- All AI interactions will be logged for audit and safety monitoring.

---

## 2. Current State (as of now)
- **Frontend:**
  - `AIChatWidget.tsx`, `AIChatPage.tsx`, `AIPage.tsx` provide chat UI and connect to `/api/v1/ai-chat/message`.
  - Uses Axios for API calls, Redux for state (optionally).
- **Backend:**
  - `src/routes/aiChat.js` exposes `/api/v1/ai-chat/message` (simulated AI response).
  - `/api/v1/ai/consult` is a stub (not implemented).
- **No real OpenAI/GPT or external AI integration yet.**

## 3. Next Steps
- [ ] Decide on AI provider (OpenAI, Azure, local model, etc.).
- [ ] Implement real AI backend integration (replace simulation in `aiChat.js`).
- [ ] Add logging of all AI interactions for audit.
- [ ] Expand AI context to include user role, recent actions, and (optionally) structured data.
- [ ] (Optional) Add image/document analysis if desired.

---

*Update this file as you ask more questions or refine the AI scope.* 