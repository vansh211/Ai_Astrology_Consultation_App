import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

const FAQ_ANSWERS = [
  {
    q: 'How do I book an astrologer?',
    a: 'Go to Pandits in the navigation menu, browse pandit profiles, and select an available time slot to request a booking.',
  },
  {
    q: 'Where can I see my horoscope?',
    a: 'Your daily horoscope and consultation summaries are available on your Dashboard and under Consultations after a session.',
  },
  {
    q: 'How do I view past consultations?',
    a: 'Navigate to Consultations from the menu to see your full history, transcripts, and AI-generated summaries.',
  },
  {
    q: 'How do I contact support?',
    a: 'Use the Report a Problem option in the footer to submit a complaint, and our team will get back to you shortly.',
  },
];

const HelpAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I\'m your Tumhara Pandit assistant. How can I help you today? Try asking about bookings, horoscopes, or consultations.',
    },
  ]);
  const [input, setInput] = useState('');

  const getReply = (question) => {
    const lower = question.toLowerCase();

    if (lower.includes('book') || lower.includes('appointment') || lower.includes('slot')) {
      return FAQ_ANSWERS[0].a;
    }
    if (lower.includes('horoscope') || lower.includes('daily') || lower.includes('zodiac')) {
      return FAQ_ANSWERS[1].a;
    }
    if (lower.includes('past') || lower.includes('history') || lower.includes('consult')) {
      return FAQ_ANSWERS[2].a;
    }
    if (lower.includes('support') || lower.includes('help') || lower.includes('contact') || lower.includes('complaint')) {
      return FAQ_ANSWERS[3].a;
    }
    return 'I can help with bookings, horoscopes, and consultations. For specific issues, please use the "Report a Problem" link in the footer.';
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: getReply(userMsg) },
      ]);
    }, 400);
  };

  const handleQuickQuestion = (faq) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: faq.q },
      { role: 'assistant', text: faq.a },
    ]);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-astro-dark text-white shadow-lg shadow-astro-dark/20 flex items-center justify-center hover:bg-neutral-800 transition-all hover:scale-105"
        aria-label="Open help assistant"
      >
        <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] astro-card overflow-hidden shadow-2xl flex flex-col animate-in">
          {/* Header */}
          <div className="bg-astro-dark text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-serif text-sm font-semibold">Help Assistant</p>
                <p className="text-[10px] text-white/60">Ask me anything</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 max-h-72 overflow-y-auto p-4 space-y-3 bg-astro-cream">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-astro-dark text-white rounded-br-md'
                      : 'bg-white text-astro-dark border border-astro-border rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 bg-astro-cream">
              {FAQ_ANSWERS.slice(0, 3).map((faq) => (
                <button
                  key={faq.q}
                  onClick={() => handleQuickQuestion(faq)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-astro-border text-astro-muted hover:border-astro-dark hover:text-astro-dark transition-colors"
                >
                  {faq.q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-astro-border bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 astro-input px-4 py-2 text-xs"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-astro-dark text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default HelpAssistant;
