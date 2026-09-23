import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Key, CheckCircle, ArrowRight } from 'lucide-react';
import { Project } from '../../types/project';
import { AICopilotService, CopilotResponse } from '../../services/aiCopilotService';
import { AurumCard } from '../common/AurumCard';
import { AurumModal } from '../common/AurumModal';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  structured?: CopilotResponse;
}

interface CopilotChatProps {
  project: Project;
  allProjects: Project[];
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ project, allProjects }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      timestamp: 'Just now',
      structured: {
        answer: `Master Dev Copilot is synchronized with ${project.name} (${project.code}). Current status is evaluated as ${project.status} with an overall risk score of ${project.riskScore}/100. How can I assist with your project intelligence analysis?`,
        evidence: [
          `Current progress is ${project.physicalProgress}% with ${project.elapsedDuration} of ${project.plannedDuration} months elapsed.`,
          `Cost burn rate efficiency (CPI) is ${project.evm.cpi}; Schedule performance index (SPI) is ${project.evm.spi}.`,
        ],
        projectDataUsed: [
          { label: 'Project', value: project.name },
          { label: 'Risk Score', value: `${project.riskScore}/100` },
          { label: 'Expenditure', value: `₹${project.currentExpenditure} / ₹${project.plannedCost} Cr` },
        ],
        nextInvestigation: 'Inspect early warning signals or ask "Why is this project at risk?" for an evidence-grounded root cause decomposition.',
        source: 'DETERMINISTIC_ENGINE',
      },
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('aurum_gemini_api_key') || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    `Why is ${project.name.split(' ')[0]} at risk?`,
    'What is driving the projected cost overrun?',
    'Analyze the delayed milestone impact on critical path',
    'What are the recommended interventions to recover schedule?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (promptToSend?: string) => {
    const queryText = promptToSend || inputPrompt;
    if (!queryText.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: queryText,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await AICopilotService.query(queryText, project, allProjects);
      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured: response,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Copilot query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = () => {
    if (geminiKey.trim()) {
      localStorage.setItem('aurum_gemini_api_key', geminiKey.trim());
    } else {
      localStorage.removeItem('aurum_gemini_api_key');
    }
    setIsKeyModalOpen(false);
  };

  return (
    <div className="flex flex-col h-[640px] md:h-[720px] bg-obsidian-2/90 border border-silver/15 rounded-showcase shadow-deep overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-silver/10 bg-obsidian-1 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-silver-bright to-silver-dark flex items-center justify-center shadow-silver-glow">
            <Bot size={15} className="text-obsidian-0" />
          </div>
          <div>
            <h3 className="font-display text-sm md:text-base text-bone font-medium">
              PROJECT INTELLIGENCE COPILOT
            </h3>
            <p className="font-mono text-[0.62rem] text-bone-muted tracking-wider uppercase">
              GROUNDED EVIDENCE & FORECAST ENGINE
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsKeyModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian-3 border border-silver/15 hover:border-silver/30 text-[0.68rem] font-mono text-bone-muted hover:text-bone transition-colors"
        >
          <Key size={12} className={geminiKey ? 'text-emerald-400' : 'text-bone-muted'} />
          <span>{geminiKey ? 'GEMINI API CONFIGURED' : 'CONFIG API KEY (OPTIONAL)'}</span>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[90%] md:max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.sender === 'user'
                  ? 'bg-obsidian-4 border border-silver/20 text-silver-bright'
                  : 'bg-gradient-to-br from-silver to-steel text-obsidian-0 font-bold'
              }`}
            >
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble */}
            {msg.sender === 'user' ? (
              <div className="p-3.5 rounded-2xl rounded-tr-sm bg-obsidian-4 border border-silver/15 text-xs text-bone shadow-soft">
                {msg.text}
              </div>
            ) : (
              <div className="space-y-3 w-full">
                {msg.structured && (
                  <AurumCard variant="compact" className="p-4 md:p-5 text-xs border-silver/20 bg-obsidian-1/90 space-y-4">
                    {/* Answer section */}
                    <div>
                      <span className="mono-label block text-silver mb-1.5 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-silver-bright" />
                        ANSWER
                      </span>
                      <p className="text-bone leading-relaxed text-[0.82rem] font-sans">
                        {msg.structured.answer}
                      </p>
                    </div>

                    {/* Evidence section */}
                    {msg.structured.evidence.length > 0 && (
                      <div className="pt-3 border-t border-silver/10">
                        <span className="mono-label block text-silver-deep mb-1.5">
                          GROUNDED EVIDENCE
                        </span>
                        <ul className="space-y-1.5 pl-1">
                          {msg.structured.evidence.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-bone-2 text-[0.78rem]">
                              <span className="text-silver-bright font-bold shrink-0 mt-0.5">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Project Data Used */}
                    {msg.structured.projectDataUsed.length > 0 && (
                      <div className="pt-3 border-t border-silver/10">
                        <span className="mono-label block text-silver-dark mb-1.5">
                          PROJECT DATA USED
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.structured.projectDataUsed.map((data, idx) => (
                            <span
                              key={idx}
                              className="font-mono text-[0.68rem] px-2 py-0.5 rounded bg-obsidian-3 border border-silver/10 text-bone-muted"
                            >
                              <strong className="text-silver-bright font-normal">{data.label}:</strong> {data.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* What to investigate next */}
                    {msg.structured.nextInvestigation && (
                      <div className="pt-3 border-t border-silver/10 bg-obsidian-2/50 -mx-4 -mb-4 p-3 rounded-b-stat">
                        <span className="mono-label block text-amber-300/90 mb-1 flex items-center gap-1">
                          <ArrowRight size={11} />
                          WHAT TO INVESTIGATE NEXT
                        </span>
                        <p className="text-bone-2 text-[0.78rem] font-sans">
                          {msg.structured.nextInvestigation}
                        </p>
                      </div>
                    )}
                  </AurumCard>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading state */}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-silver to-steel flex items-center justify-center shrink-0">
              <Bot size={14} className="text-obsidian-0" />
            </div>
            <div className="p-4 rounded-xl bg-obsidian-3/80 border border-silver/15 text-xs text-bone-muted font-mono flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-silver-bright animate-ping" />
              <span>ANALYZING INFRASTRUCTURE TELEMETRY...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts carousel / bar */}
      <div className="px-4 py-2 border-t border-silver/10 bg-obsidian-1/60 overflow-x-auto flex gap-2">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="whitespace-nowrap font-mono text-[0.68rem] px-3 py-1.5 rounded-full bg-obsidian-3 hover:bg-obsidian-4 border border-silver/10 hover:border-silver/25 text-bone-muted hover:text-bone transition-all shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-silver/10 bg-obsidian-1 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={e => setInputPrompt(e.target.value)}
          placeholder={`Ask about ${project.name} telemetry, cost trajectory, risk drivers...`}
          className="flex-1 bg-obsidian-2 border border-silver/15 rounded-pill px-4 py-2.5 text-xs text-bone placeholder-bone-faint focus:outline-none focus:border-silver/40 font-sans"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="btn-aurum-primary !p-2.5 !rounded-full shrink-0 disabled:opacity-30"
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </form>

      {/* Modal for optional Gemini API Key */}
      <AurumModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        title="AI Intelligence Model Configuration"
        subtitle="GEMINI LLM INTEGRATION OR GROUNDED DETERMINISTIC MODE"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-bone-muted leading-relaxed">
            Master Dev features a dual-mode intelligence layer. By default, it operates in
            <strong className="text-bone"> Grounded Deterministic Mode</strong>, analyzing project
            telemetry, EVM metrics, and root causes directly.
          </p>
          <p className="text-bone-muted leading-relaxed">
            Optionally provide a Google Gemini API key to enable live multimodal generation. Keys are stored
            only in your browser session and never transmitted to any third party.
          </p>

          <div>
            <label className="mono-label block mb-1.5">GOOGLE GEMINI API KEY</label>
            <input
              type="password"
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-obsidian-3 border border-silver/20 rounded-lg px-3 py-2 text-xs text-bone font-mono focus:outline-none focus:border-silver"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-silver/10">
            <button
              type="button"
              onClick={() => {
                setGeminiKey('');
                localStorage.removeItem('aurum_gemini_api_key');
                setIsKeyModalOpen(false);
              }}
              className="btn-aurum-secondary !py-2"
            >
              Reset to Deterministic Engine
            </button>
            <button
              type="button"
              onClick={handleSaveKey}
              className="btn-aurum-primary !py-2"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </AurumModal>
    </div>
  );
};
