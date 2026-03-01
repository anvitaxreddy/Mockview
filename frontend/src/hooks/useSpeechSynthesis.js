import { useState, useCallback, useEffect, useRef } from "react";

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const getPreferredVoice = useCallback(() => {
    // Prefer natural-sounding English voices
    const preferences = [
      "Google UK English Male",
      "Google US English",
      "Daniel",
      "Samantha",
      "Alex",
    ];

    for (const pref of preferences) {
      const found = voices.find((v) => v.name.includes(pref));
      if (found) return found;
    }

    // Fall back to first English voice
    return (
      voices.find((v) => v.lang.startsWith("en")) || voices[0] || null
    );
  }, [voices]);

  const speak = useCallback(
    (text, onEnd) => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getPreferredVoice();
      if (voice) utterance.voice = voice;

      utterance.rate = 0.95; // Slightly slower for interview clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [getPreferredVoice]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop, voices };
}
