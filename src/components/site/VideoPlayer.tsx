import { useState } from "react";
import { Play, X } from "lucide-react";

/** Turn a YouTube / Vimeo watch URL into an embeddable URL. */
export function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1&rel=0`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export const isUploadedVideo = (url?: string | null, type?: string | null) =>
  !!url && (type === "upload" || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url));

/** Inline player: muted looping MP4 (Flipkart style) or a click-to-play embed. */
export function VideoPlayer({
  url,
  type,
  poster,
  className = "",
  label = "Watch video",
}: {
  url: string;
  type?: string | null;
  poster?: string | null;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  if (isUploadedVideo(url, type)) {
    return (
      <video
        src={url}
        poster={poster ?? undefined}
        className={`size-full object-cover ${className}`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }

  const embed = toEmbedUrl(url);
  if (!embed) return null;

  return (
    <div className={`relative size-full ${className}`}>
      {open ? (
        <>
          <iframe
            src={embed}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close video"
            className="absolute top-2 right-2 grid place-items-center size-8 rounded-full bg-background/85 border border-border"
          >
            <X className="size-4" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={label}
          className="group relative size-full"
        >
          {poster ? (
            <img src={poster} alt={label} className="size-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="size-full gradient-festive opacity-80" />
          )}
          <span className="absolute inset-0 grid place-items-center bg-background/25 group-hover:bg-background/10 transition">
            <span className="grid place-items-center size-14 rounded-full bg-background/90 border border-border shadow-luxe group-hover:scale-110 transition">
              <Play className="size-6 text-primary fill-primary" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
