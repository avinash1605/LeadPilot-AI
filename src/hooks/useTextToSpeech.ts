import { useEffect, useRef, useState } from "react";
import { voiceConfig } from "@/lib/voice-config";

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakWithElevenLabs = async (text: string) => {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.elevenLabs.voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": voiceConfig.elevenLabs.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: voiceConfig.elevenLabs.modelId,
          voice_settings: {
            stability: voiceConfig.elevenLabs.stability,
            similarity_boost: voiceConfig.elevenLabs.similarityBoost,
          },
        }),
      }
    );

    if (!response.ok) throw new Error("ElevenLabs TTS failed");

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    return new Promise<void>((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.play();
    });
  };

  const speakWithBrowser = (text: string) =>
    new Promise<void>((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (voice) =>
          voice.name.includes("Google") ||
          voice.name.includes("Samantha") ||
          voice.name.includes("Karen")
      );
      if (preferred) utterance.voice = preferred;
      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });

  const speak = async (text: string) => {
    if (!text.trim()) return;
    setIsSpeaking(true);
    try {
      if (voiceConfig.isElevenLabsAvailable()) {
        await speakWithElevenLabs(text);
      } else if (voiceConfig.isBrowserTTSAvailable()) {
        await speakWithBrowser(text);
      }
    } catch (error) {
      if (voiceConfig.isBrowserTTSAvailable()) {
        await speakWithBrowser(text);
      }
    } finally {
      setIsSpeaking(false);
    }
  };

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (voiceConfig.isBrowserTTSAvailable()) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return { speak, stop, isSpeaking };
}
