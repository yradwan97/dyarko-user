"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  PlayIcon,
  PauseIcon,
  Volume2Icon,
  VolumeXIcon,
  MaximizeIcon,
  MinimizeIcon,
  SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  className?: string;
}

export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  onPlay,
  onPause,
  onEnded,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);

  let hideControlsTimeout: NodeJS.Timeout;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("volumechange", handleVolumeChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [onPlay, onPause, onEnded]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    if (newVolume === 0) {
      video.muted = true;
    } else if (video.muted) {
      video.muted = false;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    video.currentTime = percentage * video.duration;
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimeout);
    if (isPlaying) {
      hideControlsTimeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-lg bg-black",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full"
        onClick={togglePlay}
        autoPlay={autoPlay}
        playsInline
      >
        Your browser does not support the video tag.
      </video>

      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 p-6 text-white transition-all hover:bg-black/90 hover:scale-110"
        >
          <PlayIcon className="h-12 w-12" />
        </button>
      )}

      {/* Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="mb-3 h-1.5 w-full cursor-pointer rounded-full bg-white/30 hover:h-2"
          onClick={handleProgressClick}
        >
          {/* Buffered Progress */}
          <div
            className="absolute h-1.5 rounded-full bg-white/50 transition-all hover:h-2"
            style={{ width: `${buffered}%` }}
          />
          {/* Current Progress */}
          <div
            className="relative h-1.5 rounded-full bg-main-500 transition-all hover:h-2"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-main-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="rounded p-2 text-white transition-colors hover:bg-white/20"
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="rounded p-2 text-white transition-colors hover:bg-white/20"
              >
                {isMuted || volume === 0 ? (
                  <VolumeXIcon className="h-5 w-5" />
                ) : (
                  <Volume2Icon className="h-5 w-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>

            {/* Time Display */}
            <span className="text-sm text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="rounded p-2 text-white transition-colors hover:bg-white/20"
            >
              {isFullscreen ? (
                <MinimizeIcon className="h-5 w-5" />
              ) : (
                <MaximizeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
