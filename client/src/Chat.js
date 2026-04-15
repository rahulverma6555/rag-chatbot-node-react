import { useState } from "react";
import { sendMessage } from "./api";
import Toast from "./Toast";
import "./style.css";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    // Error messages stay longer (8 seconds), others stay 4 seconds
    const duration = type === 'error' ? 15000 : 4000;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const send = async () => {
    if (!input) return;
    setMessages(m => [...m, { role: "user", text: input }]);
    setLoading(true);

    try {
      const reply = await sendMessage(input);
      setMessages(m => [...m, { role: "bot", text: reply }]);
    } catch (error) {
      let errorMessage = "Sorry, something went wrong. Please try again.";
      
      if (error.response?.data?.error) {
        // Clean up the error message for better display
        const rawError = error.response.data.error;
        if (rawError.includes('429')) {
          errorMessage = "API quota exceeded. Please check your OpenAI billing and try again.";
        } else if (rawError.includes('401')) {
          errorMessage = "Invalid API key. Please check your OpenAI API key configuration.";
        } else if (rawError.includes('500')) {
          errorMessage = "Server error. Please try again in a moment.";
        } else {
          errorMessage = rawError;
        }
      } else if (error.message) {
        errorMessage = `Connection error: ${error.message}`;
      }
      
      addToast(errorMessage, 'error');
    }
    
    setInput("");
    setLoading(false);
  };

  return (
    <div className="wrapper">
      <h1>AI Chat</h1>

      <div className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
      </div>

      <div className="input-area">
        <input 
          value={input} 
          onChange={e=>setInput(e.target.value)} 
          placeholder="Type your message..."
          onKeyPress={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} disabled={loading || !input.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}