import { useRef, useState } from "react";
import { Upload, X, Loader2, Link2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const BUCKET = "offer-videos";

/**
 * Admin video picker — either paste a YouTube/Vimeo link or upload an MP4.
 * Reports both the url and the type ("link" | "upload") to the parent.
 */
export function MediaUpload({
  value,
  type,
  onChange,
  label = "Video",
}: {
  value: string;
  type: string;
  onChange: (next: { video_url: string; video_type: string }) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"link" | "upload">(type === "upload" ? "upload" : "link");

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast.error("Please choose a video file"); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error("Video must be under 50MB"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data, error: sErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, TEN_YEARS);
      if (sErr || !data) throw sErr ?? new Error("Could not sign URL");
      onChange({ video_url: data.signedUrl, video_type: "upload" });
      toast.success("Video uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {(["link", "upload"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
              mode === m ? "gradient-festive text-primary-foreground border-transparent" : "border-border hover:border-primary"
            }`}
          >
            {m === "link" ? <Link2 className="size-3" /> : <Upload className="size-3" />}
            {m === "link" ? "Paste link" : "Upload file"}
          </button>
        ))}
      </div>

      {mode === "link" ? (
        <Input
          value={type === "upload" ? "" : value}
          onChange={(e) => onChange({ video_url: e.target.value, video_type: "link" })}
          placeholder="https://www.youtube.com/watch?v=..."
          aria-label={`${label} link`}
        />
      ) : (
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => upload(e.target.files)} />
          <Button type="button" variant="outline" className="rounded-full" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Upload className="size-4 mr-2" />}
            {busy ? "Uploading…" : "Choose video (max 50MB)"}
          </Button>
        </div>
      )}

      {value && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
          <Film className="size-4 text-primary shrink-0" />
          <span className="text-xs truncate flex-1">{value}</span>
          <button type="button" aria-label="Remove video" onClick={() => onChange({ video_url: "", video_type: "" })}>
            <X className="size-4 text-destructive" />
          </button>
        </div>
      )}
    </div>
  );
}
