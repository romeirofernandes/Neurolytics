// utils/VoiceManager.js
export default class VoiceManager {
  constructor({ lang = 'en-US', interimResults = false } = {}) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) throw new Error('Web Speech API not supported in this browser.');
    this.recognition = new SpeechRecognition();
    this.recognition.lang = lang;
    this.recognition.interimResults = interimResults;
    this.recognition.maxAlternatives = 1;
    this._onResult = null;
    this._onEnd = null;
    this.recognition.onresult = (event) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      if (this._onResult) this._onResult({ transcript, confidence, event });
    };
    this.recognition.onerror = (e) => {
      console.warn('Speech recognition error', e);
      // handle specific errors: 'no-speech', 'aborted', etc.
    };
    this.recognition.onend = () => { if (this._onEnd) this._onEnd(); };
  }

  start(onResult, onEnd) {
    this._onResult = onResult;
    this._onEnd = onEnd;
    try { this.recognition.start(); } catch (err) { console.warn('start err', err); }
  }

  stop() {
    try { this.recognition.stop(); } catch (err) { console.warn('stop err', err); }
  }

  abort() {
    try { this.recognition.abort(); } catch (err) { console.warn('abort err', err); }
  }
}
