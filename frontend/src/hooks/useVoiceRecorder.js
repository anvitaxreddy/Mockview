import { useState, useRef, useCallback } from "react";

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      setTranscript("");
      setInterimTranscript("");
      finalTranscriptRef.current = "";
      chunksRef.current = [];

      // ─── Start Audio Recording ─────────────────────────
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        clearInterval(timerRef.current);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);

      // ─── Start Speech Recognition (Browser STT — FREE) ───
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          let interim = "";
          let final = "";

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              final += result[0].transcript + " ";
            } else {
              interim += result[0].transcript;
            }
          }

          if (final) {
            finalTranscriptRef.current = final.trim();
            setTranscript(final.trim());
          }
          setInterimTranscript(interim);
        };

        recognition.onerror = (event) => {
          console.warn("Speech recognition error:", event.error);
          if (event.error !== "no-speech" && event.error !== "aborted") {
            setError(`Speech recognition: ${event.error}`);
          }
        };

        recognition.onend = () => {
          // Auto-restart if still recording (Chrome stops after ~60s silence)
          if (mediaRecorderRef.current?.state === "recording") {
            try {
              recognition.start();
            } catch {
              // Already running
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        console.warn("SpeechRecognition not supported.");
        setError("Speech recognition not supported. Please use Chrome.");
      }

      // ─── Timer ────────────────────────────────────────
      setIsRecording(true);
      setDuration(0);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      setError("Microphone access denied. Please allow microphone permissions.");
      console.error("Recording error:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setInterimTranscript("");

    return finalTranscriptRef.current;
  }, []);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setTranscript("");
    setInterimTranscript("");
    setDuration(0);
    setError(null);
    finalTranscriptRef.current = "";
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    audioBlob,
    transcript,
    interimTranscript,
    duration,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
