"use client";

import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

type ModelAudioPlayerProps = {
  audioUrl?: string | null;
  status?: string | null;
  durationSeconds?: number | null;
};

const formatTime = (value?: number | null) => {
  if (!value || Number.isNaN(value) || value === Infinity) {
    return "0:00";
  }
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export function ModelAudioPlayer({ audioUrl, status, durationSeconds }: ModelAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [internalDuration, setInternalDuration] = useState(durationSeconds ?? 0);

  const hasAudio = Boolean(audioUrl);
  const duration = useMemo(() => internalDuration || durationSeconds || 0, [internalDuration, durationSeconds]);
  const progress = duration > 0 ? Math.min(Math.max((currentTime / duration) * 100, 0), 100) : 0;
  const statusLabel = status ?? (hasAudio ? "ready soon" : "no audio available");

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setInternalDuration(durationSeconds ?? 0);
    if (!audioUrl && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioUrl, durationSeconds]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      return;
    }
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (!Number.isNaN(audio.duration)) {
        setInternalDuration(audio.duration);
      }
    };
    const handleLoaded = () => {
      if (!Number.isNaN(audio.duration)) {
        setInternalDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlayback = useCallback(async () => {
    if (!hasAudio || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [hasAudio, isPlaying]);

  const toggleMute = useCallback(() => {
    if (!hasAudio) return;
    setIsMuted((prev) => !prev);
  }, [hasAudio]);

  const handleSeek = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!hasAudio || !audioRef.current || duration <= 0) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      audioRef.current.currentTime = ratio * duration;
      setCurrentTime(ratio * duration);
    },
    [duration, hasAudio],
  );

  return (
    <div className="rounded-2xl border border-[#1e3442] bg-[#0f202d] p-4 shadow-card" aria-label={`Audio status: ${statusLabel}`}>
      <div className="flex w-full items-center gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={!hasAudio}
          className={cn(
            "group relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#4fd3ff] to-[#1f6fff] text-white transition",
            "after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-white after:opacity-0 after:content-[''] after:transition after:duration-300 after:scale-75",
            "hover:after:opacity-15 hover:after:scale-110",
            !hasAudio && "cursor-not-allowed opacity-40",
          )}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          <span className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#7fe0ff]/30 to-[#1b4b81]/60">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </span>
        </button>

        <div className={cn("flex flex-1 items-center", !hasAudio && "opacity-40")}>
          <div className="flex w-full flex-col justify-center -translate-y-1">
            <div className="mb-1 flex justify-between text-[11px] text-slate-400 -translate-y-1.5">
              <span className="text-left">{formatTime(currentTime)}</span>
              <span className="text-right">{formatTime(duration)}</span>
            </div>
            <div className="flex items-center">
              <div
                className={cn(
                  "relative h-2 flex-1 cursor-pointer rounded-full bg-slate-800/70 -translate-y-1.5",
                  !hasAudio && "cursor-not-allowed",
                )}
                onClick={handleSeek}
              >
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#4bdcff] via-[#3a9dff] to-[#5cf4ff]"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg"
                  style={{ left: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          disabled={!hasAudio}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-[#203645] bg-[#132b3a] text-slate-100 transition hover:bg-[#1c3a4c]",
            !hasAudio && "cursor-not-allowed opacity-40",
          )}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      <audio ref={audioRef} src={audioUrl ?? undefined} preload="metadata" className="hidden" />
    </div>
  );
}
