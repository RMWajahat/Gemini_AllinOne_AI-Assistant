import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Cpu,
  Key,
  MessageSquare,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  FileText,
  Smile,
  Globe,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const MODES = [
  { id: 'chat', label: 'Smart Assistant', icon: MessageSquare, description: 'Ask anything to Gemini' },
  { id: 'summarize', label: 'Summarizer', icon: FileText, description: 'Get key insights from long text' },
  { id: 'sentiment', label: 'Sentiment Analysis', icon: Smile, description: 'Analyze tone and emotions' },
  { id: 'translate', label: 'Translator', icon: Globe, description: 'Translate to any language' },
];

const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Next Gen Fast)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Ultra Fast)' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Most Advanced)' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
  { id: 'gemini-flash-latest', label: 'Gemini Flash (Latest)' },
  { id: 'gemini-pro-latest', label: 'Gemini Pro (Latest)' },
  { id: 'gemma-3-27b-it', label: 'Gemma 3 27B (Open Model)' },
];

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [tempKey, setTempKey] = useState(apiKey);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [activeMode, setActiveMode] = useState('chat');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isKeyValid, setIsKeyValid] = useState(!!apiKey);

  const saveKey = () => {
    localStorage.setItem('gemini_api_key', tempKey);
    setApiKey(tempKey);
    setIsKeyValid(!!tempKey);
    setError(null);
  };

  const clearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setTempKey('');
    setIsKeyValid(false);
  };

  const runTask = async () => {
    if (!apiKey) {
      setError('Please provide a valid Gemini API Key first.');
      return;
    }

    if (!inputText.trim()) {
      setError('Please enter some text to process.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });

      let prompt = '';
      switch (activeMode) {
        case 'summarize':
          prompt = `Summarize the following text briefly and capture the main points:\n\n${inputText}`;
          break;
        case 'sentiment':
          prompt = `Analyze the sentiment of the following text. Be specific about the tone, emotion, and confidence level:\n\n${inputText}`;
          break;
        case 'translate':
          prompt = `Identify the language of the following text and translate it into clear, natural-sounding English. If it is already English, translate it to Spanish:\n\n${inputText}`;
          break;
        default:
          prompt = inputText;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setResult(text);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while communicating with Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const listAvailableModels = async () => {
    if (!apiKey) {
      setError('Please provide a valid Gemini API Key first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      // Note: listModels is currently not well documented in the simple SDK 
      // but the error message suggested calling ListModels.
      // In the @google/generative-ai SDK, it might be different or require a direct fetch.
      // However, we can try to "probe" common models or just show helpful advice.

      // Attempting to use the SDK to list models if available
      // If not, we'll provide a clear error message with suggestions.
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();

      if (data.models) {
        const modelList = data.models.map(m => m.name.replace('models/', '')).join('\n');
        setResult(`Supported models for your API Key:\n\n${modelList}`);
      } else {
        throw new Error(data.error?.message || 'Could not fetch models list.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not list models. This usually happens if the API key is invalid or restricted. Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <motion.div
            initial={{ rotate: -20 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Cpu size={32} color="#8e44ad" />
          </motion.div>
          <h1>NLP Lab <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>Gemini Tester</span></h1>
        </div>

        <div className="status-indicator">
          {isKeyValid ? (
            <span className="status-badge status-valid"><CheckCircle size={14} style={{ marginRight: 4 }} /> API Key Set</span>
          ) : (
            <span className="status-badge status-missing"><AlertCircle size={14} style={{ marginRight: 4 }} /> Missing API Key</span>
          )}
        </div>
      </header>

      <section className="glass api-key-section">
        <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Gemini API Key</label>
        <div className="input-group">
          <input
            type="password"
            placeholder="Enter your API Key here..."
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={saveKey}>Save Key</button>
          {apiKey && <button className="btn-outline" onClick={clearKey}>Clear</button>}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Your key is stored locally in your browser. Get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Google AI Studio</a>.
        </p>

        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Select Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{ width: '100%', cursor: 'pointer' }}
          >
            {AVAILABLE_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Note: If you get a 404 error, that specific model might not be enabled for your key yet.
          </p>
          <button
            className="btn-outline"
            onClick={listAvailableModels}
            style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.75rem', padding: '0.5rem' }}
          >
            Check All Supported Models for this Key
          </button>
        </div>
      </section>

      <div className="main-layout">
        <aside className="sidebar">
          {MODES.map((mode) => (
            <div
              key={mode.id}
              className={`nav-item ${activeMode === mode.id ? 'active' : ''}`}
              onClick={() => {
                setActiveMode(mode.id);
                setResult('');
                setError(null);
              }}
            >
              <mode.icon size={20} />
              <span>{mode.label}</span>
            </div>
          ))}
        </aside>

        <main className="glass content-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem' }}>{MODES.find(m => m.id === activeMode).label}</h2>
            <Zap size={18} color="var(--primary)" />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {MODES.find(m => m.id === activeMode).description}
          </p>

          <textarea
            placeholder={activeMode === 'chat' ? "Type your prompt or question here..." : "Paste the text you want to process..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ height: '150px', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-primary"
              onClick={runTask}
              disabled={isLoading}
              style={{ padding: '0.75rem 2.5rem' }}
            >
              {isLoading ? <Loader2 className="loader" /> : <><Send size={18} /> Execute</>}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ color: 'var(--error)', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '0.9rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                {error}
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="result-card"
              >
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={16} /> Gemini Result:
                </div>
                {result}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
