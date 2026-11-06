'use client';

import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/lib/consent';

/*
 * The product demo video (docs/DEMO_VIDEO_PLAN.md), served from public/video/.
 * - DemoVideoLoop: the home page section. A silent 13 second loop plays while
 *   it's on screen (not at all for people who ask their device for less
 *   motion); "Watch with sound" opens the full video in a dialog.
 * - DemoVideoPlayer: a plain player with captions, for /how-it-works (full
 *   video) and /watch (the 30 second cut that emails link to).
 * Nothing downloads until it's needed: preload="none", and the loop's source is
 * only set once it comes near the screen.
 */

const FILES = {
  main: { src: '/video/sbe-demo-main.mp4', captions: '/video/sbe-demo-main.vtt' },
  short: { src: '/video/sbe-demo-30s.mp4', captions: '/video/sbe-demo-30s.vtt' },
  loop: '/video/sbe-demo-loop.mp4',
  poster: '/video/sbe-demo-poster.jpg',
};

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2.5v11l9.5-5.5z" fill="currentColor" />
    </svg>
  );
}

export function DemoVideoLoop() {
  const loopRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fullRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = loopRef.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      userPaused.current = true;
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        if (!video.getAttribute('src')) video.src = FILES.loop;
        if (!userPaused.current) void video.play().catch(() => {});
      },
      { rootMargin: '200px' },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function toggleLoop() {
    const video = loopRef.current;
    if (!video) return;
    if (!video.getAttribute('src')) video.src = FILES.loop;
    const pause = !video.paused;
    userPaused.current = pause;
    setPaused(pause);
    if (pause) video.pause();
    else void video.play().catch(() => {});
  }

  function open() {
    loopRef.current?.pause();
    dialogRef.current?.showModal();
    const full = fullRef.current;
    if (full) {
      full.currentTime = 0;
      void full.play().catch(() => {});
    }
    trackEvent('demo_video_open', { where: 'home' });
  }

  function closed() {
    fullRef.current?.pause();
    if (!userPaused.current) void loopRef.current?.play().catch(() => {});
  }

  return (
    <div className="sbe-mkt-video">
      <div className="sbe-mkt-video-frame">
        <video
          ref={loopRef}
          className="sbe-mkt-video-media"
          poster={FILES.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label="A short silent preview of Serve By Example"
        />
        <button type="button" className="sbe-mkt-video-play" onClick={open}>
          <PlayIcon />
          Watch with sound
          <span className="sbe-mkt-video-length">1 min</span>
        </button>
        <button
          type="button"
          className="sbe-mkt-video-pause"
          onClick={toggleLoop}
          aria-label={paused ? 'Play the preview' : 'Pause the preview'}
        >
          {paused ? (
            <PlayIcon />
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <rect x="2.5" y="2" width="3" height="10" rx="1" fill="currentColor" />
              <rect x="8.5" y="2" width="3" height="10" rx="1" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="sbe-mkt-video-dialog"
        aria-label="Serve By Example demo video"
        onClose={closed}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <button type="button" className="sbe-mkt-video-close" onClick={() => dialogRef.current?.close()} aria-label="Close the video">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <video ref={fullRef} className="sbe-mkt-video-media" src={FILES.main.src} poster={FILES.poster} controls playsInline preload="none">
          {/* The words are already on screen, so captions are there to turn on, not on by default. */}
          <track kind="captions" src={FILES.main.captions} srcLang="en-AU" label="English" />
        </video>
      </dialog>
    </div>
  );
}

export function DemoVideoPlayer({ which, where }: { which: 'main' | 'short'; where: string }) {
  const counted = useRef(false);
  const file = FILES[which];
  return (
    <div className="sbe-mkt-video-frame">
      <video
        className="sbe-mkt-video-media"
        src={file.src}
        poster={FILES.poster}
        controls
        playsInline
        preload="none"
        onPlay={() => {
          if (counted.current) return;
          counted.current = true;
          trackEvent('demo_video_play', { where, video: which });
        }}
      >
        <track kind="captions" src={file.captions} srcLang="en-AU" label="English" />
      </video>
    </div>
  );
}
