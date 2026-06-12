const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Initialize API keys and clients
const openAiKey = process.env.OPENAI_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

let openai = null;
let genAI = null;

if (openAiKey) {
  openai = new OpenAI({ apiKey: openAiKey });
  console.log('OpenAI Whisper initialized successfully.');
} else {
  console.log('OpenAI API Key missing. Running Whisper in Mock Mode.');
}

if (geminiKey) {
  genAI = new GoogleGenerativeAI(geminiKey);
  console.log('Google Gemini API initialized successfully.');
} else {
  console.log('Gemini API Key missing. Running Gemini features in Mock Mode.');
}

/**
 * Transcribes audio using OpenAI Whisper (falls back to mock transcript if no key)
 */
const transcribeAudio = async (filePath, specialization = 'General') => {
  if (openai) {
    try {
      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
      });
      return response.text;
    } catch (error) {
      console.error('Whisper transcription failed, falling back to mock:', error.message);
    }
  }

  // MOCK TRANSCRIPT GENERATOR
  console.log(`Generating mock transcript for specialization: ${specialization}`);
  
  const mockTranscripts = {
    'Career & Finance': `Hello. Looking at your chart, the position of Saturn in your 10th house indicates you are going through a phase of significant restructuring in your career. Since last year, your progress might have felt slow, but this is a building phase. Jupiter is currently transiting your 2nd house of wealth, which suggests that after September 2026, financial blockages will ease up and you could see a major promotion or new job offer. I recommend wearing a blue sapphire or yellow sapphire after detailed testing, and chanting the Saturn mantra on Saturdays to ease the transition. You will experience career stability starting next spring.`,
    
    'Love & Relationships': `Welcome. Today we are examining your relationship compatibility. Your Venus is in Taurus, which shows you value stability and deep connection, but your partner's Mars is in Scorpio, which can lead to intense emotional power struggles. Right now, Rahu is transiting your 7th house, causing misunderstandings and temporary distance. Do not make impulsive decisions about marriage or breakups until the transit completes in November. Chanting the Venus mantra and lighting a ghee lamp in the evenings will help restore harmony. Your relationship bond will strengthen over the next six months.`,
    
    'Vedic Astrology': `Namaste. In your Vedic birth chart, your Ascendant is Leo and your moon sign is Pisces. You are currently running the Mahadasha of Rahu, which started in 2022, and the Antardasha of Mercury. This combination creates a lot of mental restlessness and search for spiritual meaning, but also brings sudden changes. Your Saturn Sade Sati phase is in its final peak, which is why you feel heavy responsibilities. Chanting the Mahamrityunjaya mantra daily and offering water to the Sun in the morning will bring you immense clarity and physical vitality.`,
    
    'Kundli & Matchmaking': `We are reviewing your Kundli matchmaking chart. Out of 36 Gunas, you and your partner match 26 Gunas, which is an excellent score for marital happiness. There is no major Nadi Dosha, however, there is a mild Manglik Dosha in the girl's chart as Mars is in the 4th house. This can cause occasional arguments regarding household matters. To neutralize this, performing a Kumbh Vivah or fasting on Tuesdays is highly recommended. The overall alignment of Jupiter ensures that family support will be strong, and marriage post-October is highly auspicious.`,
    
    'Numerology': `Based on your birth date, your Life Path Number is 7, which makes you a natural seeker, analyst, and intuitive thinker. Your current personal year number for 2026 is 8, representing power, material focus, and karmic loops. This is a year of harvesting what you have sown over the past seven years. You will face tests of integrity in business, but the numbers indicate financial gains if you stay focused. Carry a tiger's eye crystal, and focus on details before signing contracts.`,
    
    'Tarot Reading': `For your layout, we drew the Wheel of Fortune, the Hermit, and the Ten of Pentacles. This shows that you are exiting a cycle of uncertainty and entering a period of introspection (the Hermit). You need to trust your inner voice rather than external advice. The Ten of Pentacles at the end of the spread indicates that family stability, wealth, and lasting security are guaranteed if you take slow, deliberate steps. Embrace the quiet moments; your luck is turning.`,
    
    'General': `Hello. In our consultation today, we discussed your general planetary alignments. Your chart shows a strong influence of Jupiter, which gives you wisdom and teaching abilities. However, the placement of Mars in your 1st house can sometimes make you hot-tempered. Regular meditation, practicing mindfulness, and wearing silver will help balance your energies. Focus on balanced meals and gratitude journals to align your chakras.`
  };

  return mockTranscripts[specialization] || mockTranscripts['General'];
};

/**
 * Analyzes transcript using Google Gemini (falls back to mock analysis if no key)
 */
const analyzeTranscript = async (transcript, specialization = 'General') => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        You are an expert Vedic astrologer and analyst. Analyze the following consultation transcript and return a JSON object with the following keys. Do not return any Markdown wrapping or formatting outside of raw JSON:
        {
          "summary": "Detailed astrological summary of the discussion, advice, and recommended remedies",
          "keywords": ["array", "of", "4-6", "specific", "astrological", "or", "life", "keywords", "discussed"],
          "sentiment": "Positive, Neutral, or Negative based on tone and predictions"
        }

        Transcript:
        "${transcript}"
      `;
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      // Clean potential JSON markdown blocks if present
      const cleanJson = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Gemini analysis failed, falling back to mock:', error.message);
    }
  }

  // MOCK ANALYSIS ENGINE
  console.log('Generating mock Gemini analysis');
  
  let summary = '';
  let keywords = [];
  let sentiment = 'Neutral';

  if (transcript.includes('Saturn') || transcript.includes('career') || transcript.includes('job')) {
    summary = 'The consultation highlights Saturn transits in the 10th house impacting professional life. It predicts career restructuring, slow initial progress, but final success with Jupiter transits after late 2026. Recommended remedies include wearing suitable sapphires and Saturn mantra chanting.';
    keywords = ['Saturn Transit', 'Career Restructuring', 'Jupiter in 2nd House', 'Mantra Remedies', 'Professional Growth'];
    sentiment = 'Positive';
  } else if (transcript.includes('Venus') || transcript.includes('marriage') || transcript.includes('relationship')) {
    summary = 'The session centered on partner compatibility, Venus-Mars placements, and Rahu transits affecting the 7th house. Misunderstandings are flagged as temporary, with relationships stabilizing post-November. Remedies involve Venus mantras and ghee lamps.';
    keywords = ['Venus in Taurus', 'Rahu 7th House', 'Compatibility', 'Relationship Harmony', 'Marriage Timing'];
    sentiment = 'Neutral';
  } else if (transcript.includes('Gunas') || transcript.includes('Manglik')) {
    summary = 'Analyzed Kundli matchmaking showing a high compatibility of 26/36 Gunas. Addressed a mild Manglik Dosha in the 4th house and recommended Kumbh Vivah or Tuesday fasts. Marriage is highly recommended after October.';
    keywords = ['Kundli Matching', 'Guna Milan', 'Manglik Dosha', 'Kumbh Vivah', 'Marital Prosperity'];
    sentiment = 'Positive';
  } else {
    summary = 'The astrologer analyzed the client\'s current dasha cycles, highlighting major transits (Jupiter, Rahu, or Saturn) and how they influence health, mindset, and opportunities. Core remedies include daily chanting, meditation, and wearing specific crystals.';
    keywords = ['Dasha Cycle', 'Planetary Transit', 'Chakra Balancing', 'Astrological Remedies', 'Mindfulness'];
    sentiment = 'Positive';
  }

  return { summary, keywords, sentiment };
};

/**
 * Conducts a RAG-based AI chat session using the transcript as context (falls back to mock if no key)
 */
const chatWithTranscript = async (transcript, history, query) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Map history formats into Gemini's format: { role: 'user' | 'model', parts: [{ text: '...' }] }
      const geminiHistory = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));
      
      const systemInstruction = `
        You are an AI Astrology Assistant. Below is the transcript of an astrology consultation between a client and their astrologer.
        Answer the user's questions based strictly on this transcript and consultation context. If the answer cannot be found or inferred from the transcript, state that clearly. Be encouraging, professional, and focus on the astrological remedies or predictions mentioned in the transcript.
        
        Consultation Transcript:
        ---
        ${transcript}
        ---
      `;

      const chat = model.startChat({
        history: geminiHistory,
        systemInstruction: systemInstruction
      });

      const result = await chat.sendMessage(query);
      const answer = result.response.text();
      
      return [
        ...history,
        { role: 'user', content: query, timestamp: new Date() },
        { role: 'model', content: answer, timestamp: new Date() }
      ];
    } catch (error) {
      console.error('Gemini chat session failed, falling back to mock:', error.message);
    }
  }

  // MOCK CHAT BOT RESPONSE
  console.log('Generating mock chatbot response');
  let reply = '';
  const q = query.toLowerCase();

  if (q.includes('remedy') || q.includes('remedies') || q.includes('do') || q.includes('wear') || q.includes('chant')) {
    if (transcript.includes('Saturn') || transcript.includes('career')) {
      reply = 'According to the transcript, the recommended remedies are: 1) Wearing a blue sapphire or yellow sapphire (after detailed testing), and 2) Chanting the Saturn mantra on Saturdays to ease the transit effects.';
    } else if (transcript.includes('Venus') || transcript.includes('relationship')) {
      reply = 'The astrologer suggested chanting the Venus mantra and lighting a ghee lamp in the evenings to restore relationship harmony.';
    } else if (transcript.includes('Vedic')) {
      reply = 'The transcript suggests chanting the Mahamrityunjaya mantra daily and offering water to the Sun in the mornings to bring clarity and physical vitality.';
    } else if (transcript.includes('Kundli') || transcript.includes('Manglik')) {
      reply = 'To balance the mild Manglik Dosha, the astrologer recommended performing a Kumbh Vivah or fasting on Tuesdays.';
    } else {
      reply = 'The astrologer recommended standard remedies like regular meditation, wearing silver, carrying a protective crystal (like tiger\'s eye), or chanting mantras related to your current dasha lords.';
    }
  } else if (q.includes('when') || q.includes('date') || q.includes('timeline') || q.includes('month') || q.includes('year')) {
    if (transcript.includes('Saturn') || transcript.includes('career')) {
      reply = 'The astrologer mentioned that financial blockages will ease up after September 2026, and your career stability will strengthen starting next spring.';
    } else if (transcript.includes('Venus') || transcript.includes('relationship')) {
      reply = 'The transit of Rahu in the 7th house finishes in November. The astrologer advised not making impulsive decisions until then, as bonds will strengthen over the next six months.';
    } else if (transcript.includes('Kundli')) {
      reply = 'The astrologer suggested that marriage post-October is highly auspicious, and the transits align well for family support during this period.';
    } else {
      reply = 'The transcript suggests key transits changing within the next 3 to 6 months, and advises patience until the current planetary transits settle.';
    }
  } else if (q.includes('career') || q.includes('job') || q.includes('finance') || q.includes('money')) {
    if (transcript.includes('career') || transcript.includes('Saturn')) {
      reply = 'Yes, the consultation focused on your career. The astrologer noted Saturn is in your 10th house causing a career restructuring phase, but Jupiter transiting your 2nd house will bring financial ease and promotion opportunities post-September 2026.';
    } else {
      reply = 'The transcript does not focus heavily on career details. It mostly discussed relationship compatibility, dasha cycles, and spiritual alignments. If you would like to discuss career, a focused career reading would be beneficial.';
    }
  } else if (q.includes('partner') || q.includes('marriage') || q.includes('love') || q.includes('relationship') || q.includes('compatib')) {
    if (transcript.includes('relationship') || transcript.includes('Venus') || transcript.includes('Kundli')) {
      reply = 'Based on the transcript, relationship compatibility was discussed. For couples, it showed a 26/36 Guna match (good compatibility) with a mild Manglik Dosha. For the Venus/Mars alignment, it highlighted Taurus/Scorpio power struggles but indicated stabilization post-November.';
    } else {
      reply = 'This consultation was primarily focused on dasha transits or career dynamics, and did not detail relationship matchmaking. However, general recommendations were given to maintain overall emotional balance.';
    }
  } else {
    reply = `I see you are asking about: "${query}". Based on the consultation recording, the astrologer advised focusing on grounding your energies through the recommended mantras and planetary remedies, as you are currently running transits that cause mental restlessness. Please review the "Astrologer Notes" section for specific advice.`;
  }

  return [
    ...history,
    { role: 'user', content: query, timestamp: new Date() },
    { role: 'model', content: reply, timestamp: new Date() }
  ];
};

module.exports = {
  transcribeAudio,
  analyzeTranscript,
  chatWithTranscript
};
