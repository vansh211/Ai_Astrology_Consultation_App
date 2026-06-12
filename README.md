# AI-Powered Astrology Consultation Management Platform

A premium, full-stack platform where clients discover astrologers, book appointments, attend consultations, download AI-generated consultation insights, and chat directly with their session transcripts.

Features deep cosmic dark mode layout designs ("Celestial Astral" theme), interactive dashboards, slot grids, and containerized orchestration.

---

## Technical Architecture

* **Frontend**: React (Vite) + Tailwind CSS + Axios + Lucide Icons + Recharts (Analytics Graphs)
* **Backend**: Node.js + Express.js + Mongoose + PDFKit (PDF Generator)
* **Database**: MongoDB (Local Docker container or Atlas)
* **AI Pipelines**: OpenAI Whisper (Audio Speech-to-Text) & Google Gemini (Summaries, Keywords, Sentiments, and RAG Chat)
* **Email System**: Nodemailer SMTP dispatcher

---

## One-Command Startup (Docker Compose)

The repository is fully configured for containerized orchestration. Ensure Docker is running and execute:

```bash
docker compose up --build
```

This starts:
1. **Frontend**: Accessible at [http://localhost:3000](http://localhost:3000)
2. **Backend**: Accessible at [http://localhost:5000](http://localhost:5000)
3. **Database**: MongoDB running on default port `27017`

---

## Local Development Setup (Manual)

If you prefer to run the services outside Docker, follow these steps:

### 1. Prerequisites
Ensure you have Node.js (v18+) and MongoDB server installed and running.

### 2. Configure Environment
Create a `.env` file in the `backend/` directory (see `backend/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/astrology-platform
JWT_SECRET=super_secret_cosmic_jwt_key_12345

# Optional Third-Party APIs (Falls back to robust Mock Mode if empty)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
GEMINI_API_KEY=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
```

### 3. Install & Start Backend
In the `backend` directory:
```bash
npm install
npm run dev
```

### 4. Install & Start Frontend
In the `frontend` directory:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Fallback Mock Mode

If credentials for Cloudinary, OpenAI (Whisper), Gemini, or Nodemailer are not provided in `.env`, the server automatically operates in **Mock Mode**:
* **Audio Staging**: Stored locally in `backend/uploads/` and mapped to relative HTTP paths.
* **Transcriptions**: Whisper mimics outputs based on selected astrologer specialties.
* **AI Reports**: Gemini mimics summaries, key phrase tags, and sentiment values.
* **RAG Session Chats**: Chat widgets execute contextual mocks responding to queries regarding career, love, matchmaking, and dash cycles.
* **Mail Dispatch**: Nodemailer writes styled HTML bodies directly to the backend terminal log.

*This allows you to verify and test the full application lifecycle out of the box with zero setup.*
