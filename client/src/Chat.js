import { useState, useEffect } from "react";
import { sendMessage, getAvailableModels } from "./api";
import Toast from "./Toast";
import "./style.css";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [availableModels, setAvailableModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await getAvailableModels();
        setAvailableModels(models || []);
        
        if (models && models.length > 0) {
          // Find first available provider, otherwise default to demo
          const availableProvider = models.find(m => m.available);
          const demoProvider = models.find(m => m.id === 'demo');
          setSelectedProvider(availableProvider?.id || demoProvider?.id || models[0].id);
          
          // Show warnings for unavailable providers
          const unavailableProviders = models.filter(m => !m.available && m.id !== 'demo');
          if (unavailableProviders.length > 0) {
            const providerNames = unavailableProviders.map(p => p.name).join(', ');
            addToast(`${providerNames} not available. Configure API keys to enable these providers.`, 'warning');
          }
        } else {
          addToast("No models available. Please check your API key configuration.", 'warning');
        }
      } catch (error) {
        let errorMessage = "Failed to fetch available models";
        
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = `Connection error: ${error.message}`;
        }
        
        addToast(errorMessage, 'error');
      } finally {
        setModelsLoading(false);
      }
    };
    
    fetchModels();
  }, []);

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
      const reply = await sendMessage(input, selectedProvider);
      setMessages(m => [...m, { role: "bot", text: reply }]);
    } catch (error) {
      let errorMessage = "Sorry, something went wrong. Please try again.";
      
      if (error.response?.data?.error) {
        // Clean up the error message for better display
        const rawError = error.response.data.error;
        if (rawError.includes('429')) {
          errorMessage = "API quota exceeded. Please check your billing and try again.";
        } else if (rawError.includes('401')) {
          errorMessage = "Invalid API key. Please check your API key configuration.";
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

      <div className="model-selector">
        <label htmlFor="model-select">AI Model:</label>
        <select 
          id="model-select"
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          disabled={modelsLoading || loading}
          className="model-dropdown"
        >
          {modelsLoading ? (
            <option value="">Loading models...</option>
          ) : (
            availableModels.map(model => (
              <option key={model.id} value={model.id} disabled={!model.available}>
                {model.name} {!model.available ? '(API Key Required)' : ''}
              </option>
            ))
          )}
        </select>
      </div>

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