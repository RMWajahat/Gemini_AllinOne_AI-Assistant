import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Terminal,
  Command,
  FileText,
  Activity,
  Languages,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Search,
  ExternalLink,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from './assets/logo.png';
import './App.css';

const MODES = [
  { id: 'chat', label: 'Command', icon: Command, description: 'Direct neural interface for standard queries.' },
  { id: 'summarize', label: 'Summarize', icon: FileText, description: 'High-density information extraction from raw text.' },
  { id: 'sentiment', label: 'Analyze', icon: Activity, description: 'Emotional spectrum and tonal frequency mapping.' },
  { id: 'translate', label: 'Translate', icon: Languages, description: 'Universal semantic bridging across global linguistics.' },
];

const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
  { id: 'gemini-flash-latest', label: 'Gemini Flash Latest' },
  { id: 'gemini-pro-latest', label: 'Gemini Pro Latest' },
  { id: 'gemma-3-27b-it', label: 'Gemma 3 27B' },
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

  const listAvailableModels = async () => {
    if (!apiKey) return;
    setIsLoading(true);
    setResult('');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();
      if (data.models) {
        setResult(`Authorized Model Nodes:\n\n${data.models.map(m => m.name.replace('models/', '')).join('\n')}`);
      } else {
        throw new Error(data.error?.message || 'Unauthorized');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const executeTask = async () => {
    if (!apiKey) {
      setError('API Credential Required');
      return;
    }
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });

      let prompt = '';
      switch (activeMode) {
        case 'summarize': prompt = `Analyze and summarize the following data:\n\n${inputText}`; break;
        case 'sentiment': prompt = `Perform tonal and sentiment spectrum analysis:\n\n${inputText}`; break;
        case 'translate': prompt = `Bridge the semantic gap to English (or Spanish if input is English):\n\n${inputText}`; break;
        default: prompt = inputText;
      }

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      setResult(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="Logo" className="logo-img" />
          <h1>Gemma-DO</h1>
        </div>

        <div className={`status-pip ${isKeyValid ? 'status-active' : 'status-inactive'}`}>
          {isKeyValid ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          {isKeyValid ? 'System Online' : 'System Offline'}
        </div>
      </header>

      <div className="main-grid">
        <aside className="nav-sidebar">
          <span className="section-label">Capabilities</span>
          {MODES.map((mode) => (
            <div
              key={mode.id}
              className={`nav-link ${activeMode === mode.id ? 'active' : ''}`}
              onClick={() => {
                setActiveMode(mode.id);
                setResult('');
                setError(null);
              }}
            >
              <mode.icon size={18} />
              <span>{mode.label}</span>
            </div>
          ))}

          <div style={{ marginTop: '3rem' }}>
            <span className="section-label">Configuration</span>
            <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="section-label" style={{ fontSize: '0.65rem' }}>Model Node</label>
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                  {AVAILABLE_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.75rem' }} onClick={listAvailableModels}>
                <Search size={14} /> Probe Nodes
              </button>
            </div>
          </div>
        </aside>

        <main className="workspace">
          <div className="api-section">
            <span className="section-label">Authentication</span>
            <div className="input-row">
              <input
                type="password"
                placeholder="Enter Gemini API Credential..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
              />
              <button className="btn" onClick={saveKey}>Initialize</button>
              {apiKey && <button className="btn btn-secondary" onClick={clearKey}>Revoke</button>}
            </div>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" className="nav-link" style={{ padding: '1rem 0', display: 'flex' }}>
              Get authentication key <ExternalLink size={14} />
            </a>
          </div>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="section-label">{MODES.find(m => m.id === activeMode).label} Interface</span>
              <Layers size={16} color="var(--accents-4)" />
            </div>

            <div className="textarea-container">
              <textarea
                placeholder={`Input raw data for ${activeMode} analysis...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn" onClick={executeTask} disabled={isLoading}>
                {isLoading ? <div className="loader-anim" /> : <><ArrowRight size={18} /> Execute Pipeline</>}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-toast">
                  <Terminal size={14} style={{ marginRight: 8 }} /> {error}
                </motion.div>
              )}

              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="result-area">
                  <span className="section-label">Output Stack</span>
                  <div className="result-content">
                    {result}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
