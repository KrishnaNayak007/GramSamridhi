import React, { useState, useEffect, useRef } from 'react';
import './AskGramSamridhiModal.css';
import { chatApi } from '../../services/chatApi';

export default function AskGramSamridhiModal({ isOpen, onClose, user = {} }) {
  const isFarmer = user.role === 'farmer' || user.profession === 'farmer';
  const persona = isFarmer ? 'krishi' : 'swachh';
  
  const userName = user.first_name || (user.username === 'devinder_Sahu' ? 'Devinder' : user.username === 'Bhubaneswar_citizen' ? 'Priya' : user.username || (isFarmer ? 'Devinder' : 'Priya'));
  
  const defaultGreeting = isFarmer
    ? `Hi ${userName}! I can help with your pickup schedule, selling crop residue, and payment questions. What's on your mind?`
    : `Hi ${userName}! I can help with reporting waste, checking pickup status, and what you can give or sell. What do you need?`;

  const quickActions = isFarmer
    ? ["When's my next pickup?", "What can I sell as residue?", "Why is my payment pending?"]
    : ["How do I report waste?", "Status of my last report?", "What items can I sell?"];

  const [messages, setMessages] = useState([
    { id: 'initial-greeting', sender: 'bot', text: defaultGreeting }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  // Sync greeting if user/persona changes
  useEffect(() => {
    setMessages([
      { id: 'initial-greeting', sender: 'bot', text: defaultGreeting }
    ]);
  }, [user?.role, user?.username]);

  // Scroll to bottom on message update
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    const userMsgId = 'u-' + Date.now();
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: query }]);
    setInputText('');
    setLoading(true);

    try {
      const response = await chatApi.sendMessage({
        message: query,
        persona,
        userId: user.username || (isFarmer ? 'devinder_Sahu' : 'Bhubaneswar_citizen'),
        location: isFarmer ? 'Bhadana Village, Karnal' : 'BMC Ward 24, Bhubaneswar',
      });

      const botReply = response?.reply || "I am here to help you with GramSamridhi services.";
      setMessages(prev => [
        ...prev,
        { id: 'b-' + Date.now(), sender: 'bot', text: botReply, tool: response?.tool_executed }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        { id: 'b-' + Date.now(), sender: 'bot', text: "I'm having trouble connecting right now. Please try again in a moment." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ags-widget" role="dialog" aria-modal="true" aria-label="Ask GramSamridhi AI Assistant">
      {/* HEADER */}
      <div className="ags-widget-head">
        <div className="ags-widget-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <div className="ags-widget-titles">
          <div className="ags-widget-title">Ask GramSamridhi</div>
          <div className="ags-widget-sub">
            AI Assistant · {isFarmer ? "knows you're a farmer" : "knows you're a citizen"}
          </div>
        </div>

        <div className="ags-widget-head-actions">
          <div className="ags-widget-dot" title="AI Online" />
          <button 
            type="button" 
            className="ags-close-btn" 
            onClick={onClose}
            aria-label="Close assistant"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* CHAT BODY */}
      <div className="ags-widget-body" ref={bodyRef}>
        {messages.map((m) => (
          <div key={m.id} className={`ags-msg ${m.sender}`}>
            <div className="ags-msg-bubble">{m.text}</div>
          </div>
        ))}

        {loading && (
          <div className="ags-msg bot">
            <div className="ags-msg-bubble">
              <div className="ags-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK SUGGESTION CHIPS */}
      <div className="ags-chips">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            className="ags-chip"
            onClick={() => handleSend(action)}
            disabled={loading}
          >
            {action}
          </button>
        ))}
      </div>

      {/* INPUT BAR */}
      <div className="ags-widget-input">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question…"
          disabled={loading}
          autoFocus
        />
        <button
          type="button"
          className="ags-send-btn"
          onClick={() => handleSend()}
          disabled={loading || !inputText.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
