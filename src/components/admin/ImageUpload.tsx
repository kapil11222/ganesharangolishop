import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

async function toSignedUrl(bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, TEN_YEARS);
  if (error || !data) throw error ?? new Error("Could not sign URL");
  return data.signedUrl;
}

export function ImageUpload({
  bucket,
  value,
  onChange,
  multiple = false,
  label = "Upload image",
}: {
  bucket: "product-images" | "category-images" | "banner-images";
  value: string | string[];
  onChange: (next: string | string[]) => void;
  multiple?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const items = multiple ? (Array.isArray(value) ? value : []) : value ? [value as string] : [];

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB`);
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
        if (error) { toast.error(error.message); continue; }
        const url = await toSignedUrl(bucket, path);
        uploaded.push(url);
      }
      if (uploaded.length) {
        if (multiple) onChange([...(items as string[]), ...uploaded]);
        else onChange(uploaded[0]);
        toast.success(`${uploaded.length} image(s) uploaded`);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (idx: number) => {
    if (multiple) onChange((items as string[]).filter((_, i) => i !== idx));
    else onChange("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {items.map((src, i) => (
          <div key={`${src}-${i}`} className="relative group size-24 rounded-xl overflow-hidden border border-border bg-muted">
            <img src={src} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 rounded-full bg-background/90 p-1 shadow opacity-0 group-hover:opacity-100 transition"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="size-24 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
          <span>{busy ? "Uploading..." : label}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB{multiple ? " · multiple allowed" : ""}</p>
    </div>
  );
}
