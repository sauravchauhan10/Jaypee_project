// src/components/common/AIAssistantWidget.jsx
import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

// ─── Medicine Knowledge Base ───────────────────────────────────────────────────
const MEDICINES = {
  amoxicillin: {
    class: 'Antibiotic (Penicillin group)',
    uses: 'Treats bacterial infections: chest, throat, ear, urinary tract, skin',
    howItWorks: 'Kills bacteria by destroying their cell walls',
    precautions: ['Complete the FULL course even if you feel better', 'Avoid if allergic to penicillin', 'Tell your doctor about other medications', 'May reduce effectiveness of oral contraceptives'],
    sideEffects: ['Nausea', 'Diarrhea', 'Skin rash', 'Stomach upset'],
    tip: '💡 Best taken with food to reduce stomach upset.',
  },
  metformin: {
    class: 'Antidiabetic (Biguanide)',
    uses: 'Controls blood sugar in Type 2 diabetes',
    howItWorks: 'Reduces glucose production in the liver and improves insulin sensitivity',
    precautions: ['Take with meals to reduce GI side effects', 'Avoid alcohol', 'Monitor kidney function regularly', 'Stop before contrast dye procedures'],
    sideEffects: ['Nausea', 'Diarrhea', 'Stomach pain', 'Metallic taste'],
    tip: '💡 Never skip meals while taking Metformin.',
  },
  paracetamol: {
    class: 'Analgesic / Antipyretic',
    uses: 'Relieves mild to moderate pain and reduces fever',
    howItWorks: 'Blocks pain signals and resets the body\'s temperature thermostat in the brain',
    precautions: ['Do not exceed 4g/day for adults', 'Avoid alcohol', 'Be cautious if you have liver disease', 'Check other products for paracetamol content to avoid double dosing'],
    sideEffects: ['Rare at recommended doses', 'Liver damage in overdose'],
    tip: '💡 Do not take more than 8 tablets (500mg) in 24 hours.',
  },
  ibuprofen: {
    class: 'NSAID (Non-steroidal Anti-inflammatory Drug)',
    uses: 'Relieves pain, reduces inflammation and fever',
    howItWorks: 'Blocks prostaglandin production — chemicals that cause pain and swelling',
    precautions: ['Always take with food or milk', 'Avoid if you have stomach ulcers', 'Not recommended during pregnancy (3rd trimester)', 'Avoid with blood thinners'],
    sideEffects: ['Stomach upset', 'Heartburn', 'Nausea', 'Dizziness'],
    tip: '💡 Never take on an empty stomach.',
  },
  azithromycin: {
    class: 'Antibiotic (Macrolide)',
    uses: 'Treats respiratory infections, ear infections, skin infections, STIs',
    howItWorks: 'Stops bacteria from making proteins needed to survive',
    precautions: ['Avoid antacids within 2 hours', 'Tell doctor about heart conditions', 'Complete the full course', 'Avoid sun exposure (may cause photosensitivity)'],
    sideEffects: ['Diarrhea', 'Nausea', 'Stomach pain', 'Headache'],
    tip: '💡 Usually taken as a short 3–5 day course — still complete it fully.',
  },
  cetirizine: {
    class: 'Antihistamine',
    uses: 'Relieves allergy symptoms: sneezing, runny nose, itching, hives',
    howItWorks: 'Blocks histamine H1 receptors — preventing allergic reactions',
    precautions: ['May cause drowsiness — avoid driving', 'Avoid alcohol', 'Inform doctor if you have kidney disease'],
    sideEffects: ['Drowsiness', 'Dry mouth', 'Headache', 'Dizziness'],
    tip: '💡 Best taken at bedtime if drowsiness is a concern.',
  },
  omeprazole: {
    class: 'Proton Pump Inhibitor (PPI)',
    uses: 'Treats acid reflux, GERD, stomach ulcers, heartburn',
    howItWorks: 'Reduces acid production by blocking the "proton pump" in stomach cells',
    precautions: ['Take 30–60 minutes before meals for best effect', 'Long-term use may reduce B12/magnesium levels', 'Do not crush or chew capsules', 'Inform doctor about other medications'],
    sideEffects: ['Headache', 'Diarrhea', 'Nausea', 'Stomach pain'],
    tip: '💡 Best taken first thing in the morning before breakfast.',
  },
  atorvastatin: {
    class: 'Statin (Cholesterol-lowering)',
    uses: 'Lowers LDL (bad) cholesterol and triglycerides; reduces heart disease risk',
    howItWorks: 'Blocks an enzyme your liver uses to make cholesterol',
    precautions: ['Avoid grapefruit juice', 'Report unexplained muscle pain immediately', 'Regular liver function tests needed', 'Avoid during pregnancy'],
    sideEffects: ['Muscle pain/weakness', 'Headache', 'Nausea', 'Joint pain'],
    tip: '💡 Usually taken in the evening as cholesterol production peaks at night.',
  },
  aspirin: {
    class: 'Salicylate / NSAID / Antiplatelet',
    uses: 'Pain relief, fever reduction, anti-inflammatory; low-dose prevents blood clots',
    howItWorks: 'Blocks prostaglandins and inhibits platelet aggregation (clotting)',
    precautions: ['Avoid in children under 16 (risk of Reye\'s syndrome)', 'Take with food', 'Avoid with blood thinners', 'Not for stomach ulcer patients'],
    sideEffects: ['Stomach irritation', 'Bleeding risk', 'Nausea', 'Tinnitus in high doses'],
    tip: '💡 Low-dose aspirin (75–100mg) is used for heart protection — never self-prescribe this use.',
  },
};

// ─── Precautions for conditions ────────────────────────────────────────────────
const CONDITION_PRECAUTIONS = {
  diabetes: ['Monitor blood sugar regularly', 'Follow a low-glycaemic diet', 'Exercise for 30 minutes most days', 'Never skip meals', 'Stay hydrated', 'Check feet daily for wounds'],
  hypertension: ['Reduce salt intake to <5g/day', 'Exercise regularly', 'Avoid smoking and excess alcohol', 'Monitor blood pressure at home', 'Manage stress', 'Maintain healthy weight'],
  infection: ['Complete the full antibiotic course', 'Stay hydrated', 'Rest adequately', 'Wash hands frequently', 'Avoid sharing utensils', 'Monitor temperature'],
  fever: ['Stay hydrated — drink plenty of fluids', 'Rest as much as possible', 'Keep room cool and well-ventilated', 'Wear light clothing', 'Seek help if fever exceeds 103°F / 39.4°C for over 2 days'],
  allergy: ['Avoid known allergens', 'Keep antihistamines accessible', 'Wear a medical alert bracelet if severe', 'Inform all healthcare providers of your allergies', 'Carry an EpiPen if prescribed'],
  pain: ['Apply ice/heat as directed', 'Avoid overexertion', 'Take pain medication as prescribed — do not exceed dose', 'Maintain gentle movement to prevent stiffness', 'Track pain levels to discuss with doctor'],
};

// ─── Quick action chips ────────────────────────────────────────────────────────
const QUICK_CHIPS = [
  { id: 'explain', label: '💊 Explain a medicine', msg: 'Can you explain amoxicillin?' },
  { id: 'precaution', label: '⚠️ Precautions', msg: 'What precautions should I take for diabetes?' },
  { id: 'summarize', label: '📋 My prescription', msg: 'Summarize my latest prescription' },
  { id: 'sideeffects', label: '🔍 Side effects', msg: 'What are the side effects of ibuprofen?' },
];

// ─── Response engine ───────────────────────────────────────────────────────────
const DIAGNOSIS_KEYWORDS = ['do i have', 'diagnose', 'is it cancer', 'what disease', 'what illness', 'what condition do', 'am i sick', 'what\'s wrong with me', 'what is wrong with me'];
const GREETING_KEYWORDS  = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'howdy'];
const THANKS_KEYWORDS    = ['thank', 'thanks', 'thank you', 'appreciate', 'helpful'];

const findMedicine = (text) => {
  const lower = text.toLowerCase();
  return Object.keys(MEDICINES).find((med) => lower.includes(med));
};

const findCondition = (text) => {
  const lower = text.toLowerCase();
  return Object.keys(CONDITION_PRECAUTIONS).find((c) => lower.includes(c));
};

const getRuleBasedResponse = async (message, isAuthenticated) => {
  const lower = message.toLowerCase().trim();

  // ── Greetings ────────────────────────────────────────────────────────────────
  if (GREETING_KEYWORDS.some((k) => lower.startsWith(k))) {
    return {
      text: `Hello! 👋 I'm the CareBridge AI Assistant. I can help you:\n\n• 💊 Explain medicines\n• ⚠️ Suggest precautions\n• 📋 Summarize your prescription\n\n*I do not provide diagnoses. Always consult your doctor for medical advice.*\n\nWhat can I help you with today?`,
      type: 'info',
    };
  }

  // ── Thanks ────────────────────────────────────────────────────────────────────
  if (THANKS_KEYWORDS.some((k) => lower.includes(k))) {
    return { text: `You're welcome! 😊 Stay healthy and take your medicines on time. Is there anything else I can help you with?`, type: 'success' };
  }

  // ── Diagnosis block ───────────────────────────────────────────────────────────
  if (DIAGNOSIS_KEYWORDS.some((k) => lower.includes(k))) {
    return {
      text: `⚠️ **I'm unable to provide diagnosis.**\n\nCareBridge AI is designed to explain medicines and suggest precautions — not to diagnose medical conditions.\n\n**Please consult your doctor** for any concerns about your health. If this is an emergency, call emergency services immediately.`,
      type: 'warning',
    };
  }

  // ── Prescription summarize ────────────────────────────────────────────────────
  if (lower.includes('summarize') || lower.includes('my prescription') || lower.includes('latest prescription')) {
    if (!isAuthenticated) {
      return { text: `🔒 Please **log in** to your CareBridge account to summarize your prescription. Once logged in, I can pull your latest prescription details.`, type: 'warning' };
    }
    try {
      const res = await api.get('/prescriptions?limit=1');
      const rxList = res.data?.data?.prescriptions;
      if (!rxList || rxList.length === 0) {
        return { text: `📋 No prescriptions found in your account yet. Once your doctor issues one, I can summarize it here.`, type: 'info' };
      }
      const rx = rxList[0];
      const medList = rx.medicines?.map((m, i) => `${i + 1}. **${m.name}** ${m.dosage} — ${m.frequency} for ${m.duration}`).join('\n') || 'No medicines listed.';
      return {
        text: `📋 **Latest Prescription Summary**\n\n🆔 ${rx._id?.toString().slice(-8).toUpperCase()}\n📅 ${new Date(rx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n🩺 Diagnosis: **${rx.diagnosis}**\n\n**Medicines:**\n${medList}\n\n${rx.notes ? `📝 Doctor's note: ${rx.notes}\n\n` : ''}⚠️ *Always follow your doctor's specific instructions.*`,
        type: 'success',
      };
    } catch {
      return { text: `😕 I couldn't fetch your prescription right now. Please try again or visit the Prescriptions section.`, type: 'error' };
    }
  }

  // ── Explain medicine ──────────────────────────────────────────────────────────
  if (lower.includes('explain') || lower.includes('what is') || lower.includes('about') || lower.includes('tell me about')) {
    const med = findMedicine(lower);
    if (med) {
      const info = MEDICINES[med];
      return {
        text: `💊 **${med.charAt(0).toUpperCase() + med.slice(1)}**\n\n🏷️ *Class:* ${info.class}\n\n📌 *Used for:* ${info.uses}\n\n⚙️ *How it works:* ${info.howItWorks}\n\n${info.tip}\n\n⚠️ *Always take as prescribed by your doctor.*`,
        type: 'info',
      };
    }
    return { text: `I don't have information about that specific medicine in my knowledge base. Please ask your pharmacist or doctor, or try medicines like: ${Object.keys(MEDICINES).slice(0, 5).join(', ')}.`, type: 'info' };
  }

  // ── Side effects ──────────────────────────────────────────────────────────────
  if (lower.includes('side effect') || lower.includes('side-effect') || lower.includes('adverse')) {
    const med = findMedicine(lower);
    if (med) {
      const info = MEDICINES[med];
      const effects = info.sideEffects.map((s) => `• ${s}`).join('\n');
      return {
        text: `🔍 **Side Effects of ${med.charAt(0).toUpperCase() + med.slice(1)}**\n\nCommon side effects include:\n${effects}\n\n💡 If you experience severe side effects, **contact your doctor immediately**.\n\n⚠️ Not everyone experiences these — this is not a complete list.`,
        type: 'warning',
      };
    }
    return { text: `Please specify the medicine name. For example: *"Side effects of amoxicillin"*`, type: 'info' };
  }

  // ── Precautions ───────────────────────────────────────────────────────────────
  if (lower.includes('precaution') || lower.includes('careful') || lower.includes('safety') || lower.includes('warning') || lower.includes('avoid')) {
    // Medicine precautions
    const med = findMedicine(lower);
    if (med) {
      const info = MEDICINES[med];
      const precs = info.precautions.map((p) => `• ${p}`).join('\n');
      return {
        text: `⚠️ **Precautions for ${med.charAt(0).toUpperCase() + med.slice(1)}**\n\n${precs}\n\n📞 Always inform your doctor about all medications you are taking.`,
        type: 'warning',
      };
    }
    // Condition precautions
    const cond = findCondition(lower);
    if (cond) {
      const precs = CONDITION_PRECAUTIONS[cond].map((p) => `• ${p}`).join('\n');
      return {
        text: `⚠️ **Precautions for ${cond.charAt(0).toUpperCase() + cond.slice(1)}**\n\n${precs}\n\n🩺 These are general guidelines. Always follow your doctor's specific advice.`,
        type: 'warning',
      };
    }
    return { text: `Please specify the medicine or condition. For example:\n• *"Precautions for amoxicillin"*\n• *"Precautions for diabetes"*`, type: 'info' };
  }

  // ── Dosage ────────────────────────────────────────────────────────────────────
  if (lower.includes('dosage') || lower.includes('dose') || lower.includes('how much') || lower.includes('how many')) {
    return {
      text: `📏 **Dosage Guidance**\n\nI'm not able to recommend specific dosages as these depend on your weight, age, kidney function, and other factors.\n\n✅ *Always follow the dosage written on your prescription.*\n\n📞 If you're unsure, contact your pharmacist or doctor — never self-adjust doses.`,
      type: 'warning',
    };
  }

  // ── Direct Medicine Mention (Fallback before default) ───────────────────────
  const explicitMed = findMedicine(lower);
  if (explicitMed) {
    const info = MEDICINES[explicitMed];
    return {
      text: `💊 **${explicitMed.charAt(0).toUpperCase() + explicitMed.slice(1)}**\n\n🏷️ *Class:* ${info.class}\n\n📌 *Used for:* ${info.uses}\n\n⚙️ *How it works:* ${info.howItWorks}\n\n${info.tip}\n\n⚠️ *Always take as prescribed by your doctor.*`,
      type: 'info',
    };
  }

  // ── Default fallback ──────────────────────────────────────────────────────────
  return {
    text: `I'm not sure I understood that. Here's what I can help with:\n\n• 💊 **Explain a medicine** — *"Explain metformin"*\n• ⚠️ **Precautions** — *"Precautions for ibuprofen"*\n• 🔍 **Side effects** — *"Side effects of amoxicillin"*\n• 📋 **Summarize prescription** — *"Summarize my latest prescription"*\n\n*I cannot provide diagnoses. Please consult your doctor for medical decisions.*`,
    type: 'info',
  };
};

// ─── Message renderer ──────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';

  const formatText = (text) => {
    return text
      .split('\n')
      .map((line, i) => {
        const formatted = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/•/g, '•');
        return (
          <span key={i} dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }}
            className="block leading-relaxed" />
        );
      });
  };

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center flex-shrink-0 mb-1">
          <span className="text-[10px] font-bold text-white">AI</span>
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed
        ${isUser
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {isUser ? msg.text : formatText(msg.text)}
        <div className={`text-[9px] mt-1 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </div>
      </div>
    </div>
  );
};

// ─── Typing indicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-2 items-end">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center flex-shrink-0">
      <span className="text-[10px] font-bold text-white">AI</span>
    </div>
    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

// ─── Main Widget ───────────────────────────────────────────────────────────────
const AIAssistantWidget = () => {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState('');
  const [typing,  setTyping]  = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hi! I'm your CareBridge AI Assistant. 👋\n\nI can **explain medicines**, suggest **precautions**, and **summarize** your prescriptions.\n\n*Note: I do not provide medical diagnoses.*`,
      ts: Date.now(),
    },
  ]);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  // Check auth (simple token check)
  const isAuthenticated = !!localStorage.getItem('token');

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: msg, ts: Date.now() }]);
    setTyping(true);

    // Simulate thinking delay (0.8–1.5s)
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

    const response = await getRuleBasedResponse(msg, isAuthenticated);
    setTyping(false);
    setMessages((prev) => [...prev, { role: 'bot', text: response.text, type: response.type, ts: Date.now() }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

      {/* ── Chat Panel ────────────────────────────────────────────────────── */}
      {open && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
          style={{ height: '520px', animation: 'slideUp 0.25s ease-out' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-violet-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-tight">CareBridge AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-300 text-[10px]">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Disclaimer bar */}
          <div className="bg-amber-50 border-b border-amber-100 px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
            <svg className="w-3 h-3 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-[10px] text-amber-700 font-medium">Not a substitute for professional medical advice</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scroll-smooth">
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto flex-shrink-0 scrollbar-none">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.id}
                id={`ai-chip-${chip.id}`}
                onClick={() => sendMessage(chip.msg)}
                className="flex-shrink-0 text-[10px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-full transition whitespace-nowrap"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
              <input
                ref={inputRef}
                id="ai-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a medicine…"
                className="flex-1 bg-transparent text-xs text-gray-800 focus:outline-none placeholder-gray-400"
              />
              <button
                id="ai-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || typing}
                className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center transition flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FAB Toggle Button ──────────────────────────────────────────────── */}
      <button
        id="ai-widget-toggle"
        onClick={() => setOpen((v) => !v)}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-violet-700 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group"
        title="CareBridge AI Assistant"
      >
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping" />
        )}
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            <path d="M9 9l6 3-6 3V9z" fill="white" opacity="0"/>
            <circle cx="12" cy="12" r="10" fill="none"/>
            <path d="M13 9h-2v2H9v2h2v2h2v-2h2v-2h-2z" fill="white"/>
          </svg>
        )}
        {/* "AI" badge */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white flex items-center justify-center">
            <span className="text-[8px] font-black text-white">AI</span>
          </span>
        )}
      </button>

      {/* Slide-up keyframe */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default AIAssistantWidget;
