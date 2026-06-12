# AI Usage Documentation - AI-Powered Astrology Consultation Platform

This document outlines the integration of artificial intelligence models alongside human engineering in the development of the platform.

---

## AI Tools Used

### 1. OpenAI Whisper
* **Purpose**: Performs high-fidelity speech-to-text transcription of consultation voice recordings uploaded by astrologers. It outputs verbatim transcripts mapping client-astrologer conversations.

### 2. Google Gemini API
* **Purpose**: 
  * Summarization: Compiles structured, comprehensive summaries of astrological charts, transits, and dialogue discussed during readings.
  * Keyword Extraction: Generates astrological focus keywords (e.g. transits, Sade Sati, houses).
  * Sentiment Analysis: Analyzes predictive and narrative tones of readings (Positive, Neutral, Negative).
  * RAG Chat Session: Contextually processes transcripts to answer client and astrologer questions about the session.

### 3. ChatGPT
* **Purpose**: Architectural design reviews, code scaffolding assistance, mock API logic planning, code debugging, and document generation during creation.

---

## Human Contributions

The core framework, architecture, and deployment layers were fully designed and programmed by the developer:
* **System Architecture**: Organizing folders, multi-container layout configs, and cross-communication.
* **Database Design**: Structuring schemas in MongoDB (Users, Astrologers, Appointments, Consultations, Reviews).
* **Backend Implementation**: Writing routing middleware, JWT authentication, and file controllers.
* **Frontend Implementation**: Building reactive dashboards, discovery marketplaces, and cosmic responsive themes.
* **API Development**: Binding endpoints to database queries.
* **Testing & Quality Assurance**: Testing registration, slots allocation, and pipeline mocking flows.
* **Deployment Setup**: Configuring Docker, multi-stage Dockerfiles, and compose configurations.
* **Documentation**: Authoring code reviews, instructions, and plans.

---

## AI Generated Components

While the system code is human-coded, the application runtime generates content using AI models:
* **Transcript Generation**: Generated programmatically via OpenAI Whisper when processing audio.
* **Astrological Summaries**: Drafted at runtime by Gemini after analyzing session transcripts.
* **Keyword Tags**: Extracted text phrases from transcripts.
* **Sentiment Analysis Ratings**: Tone tags evaluated from conversation logs.

*All generated insights are structured and reviewed by the platform and developer before presentation to clients.*
