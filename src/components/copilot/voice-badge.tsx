export function VoiceBadge({ useElevenLabs }: { useElevenLabs: boolean }) {
  return (
    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
      {useElevenLabs ? "⚡ ElevenLabs" : "🔊 Browser Voice"}
    </span>
  );
}
