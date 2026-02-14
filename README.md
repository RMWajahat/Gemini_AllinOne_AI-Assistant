# Gemini All-in-One AI Assistant

A high-performance NLP interface powered by Gemini 2.0 and 2.5 models. Built with React and Vite for optimal developer experience and performance.

## Core Capabilities

- **Natural Language Chat**: Direct low-latency interaction with Gemini 1.5/2.0/2.5 Flash and Pro models.
- **Content Summarization**: Automated extraction of key insights from complex documents.
- **Tone Analysis**: Sentiment and emotional intelligence processing for provided text.
- **Contextual Translation**: Language detection and high-fidelity English/Spanish translation.
- **Model Diagnostics**: Real-time discovery of authorized models for a specific API credential.

## Design Architecture

- **Glassmorphic UI**: Modern aesthetic utilizing modern CSS backdrop-filters and variables.
- **Optimized Layout**: Engineered for desktop and workstation screen resolutions with intelligent overflow handling.
- **Motion System**: Smooth state transitions utilizing Framer Motion.
- **Local Persistence**: Client-side API key management via browser storage for maximum security.

## Infrastructure

- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **AI Engine**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)
- **Styling**: Vanilla CSS (Global Design Tokens)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run dev server**
   ```bash
   npm run dev
   ```

3. **Production build**
   ```bash
   npm run build
   ```

## Security

This application does not utilize a backend. All API interactions occur directly between the client's browser and Google's Generative AI endpoints. API keys are stored in the user's `localStorage` and are never transmitted to third-party services.

## License

[MIT](LICENSE)
