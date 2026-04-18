/**
 * VOICE SETUP INSTRUCTIONS:
 *
 * Option 1: ElevenLabs (recommended for demo)
 *   1. Sign up at https://elevenlabs.io (free tier available)
 *   2. Get your API key from Profile → API Keys
 *   3. Add to .env.local: NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key
 *   4. The default voice is "Rachel" — change voiceId if desired
 *
 * Option 2: Browser fallback (zero setup)
 *   - Works automatically if no ElevenLabs key is set
 *   - Uses Web Speech API for recognition (Chrome/Edge/Safari)
 *   - Uses SpeechSynthesis for TTS (all modern browsers)
 *   - Quality varies by browser and OS
 *
 * Both options look good in demos. ElevenLabs sounds more natural.
 */
export const voiceConfig = {
  elevenLabs: {
    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    modelId: "eleven_monolingual_v1",
    stability: 0.5,
    similarityBoost: 0.75,
  },
  isElevenLabsAvailable: (): boolean => {
    return !!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  },
  isBrowserSpeechAvailable: (): boolean => {
    if (typeof window === "undefined") return false;
    return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  },
  isBrowserTTSAvailable: (): boolean => {
    if (typeof window === "undefined") return false;
    return "speechSynthesis" in window;
  },
};
