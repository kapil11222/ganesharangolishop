import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, Truck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { checkPincode } from "@/lib/delhivery/shipping.functions";
import { formatINR } from "@/lib/cart-store";

type Result = {
  serviceable: boolean;
  city?: string;
  state?: string;
  cod?: boolean;
  prepaid?: boolean;
  prepaidRate?: number | null;
  codRate?: number | null;
  etaDays?: number;
};

export function PincodeCheck({
  weightGrams = 500,
  codAmount = 0,
  onResult,
  compact = false,
}: {
  weightGrams?: number;
  codAmount?: number;
  onResult?: (r: Result) => void;
  compact?: boolean;
}) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const check = useServerFn(checkPincode);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(pin)) { setError("Enter a valid 6-digit pincode"); return; }
    setError(null);
    setLoading(true);
    try {
      const r = await check({ data: { pincode: pin, weightGrams, codAmount } });
      setResult(r);
      onResult?.(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? "" : "glass rounded-2xl p-4 md:p-5"}>
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
        <MapPin className="size-4 text-primary" />
        <span>Check delivery to your pincode</span>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
          placeholder="e.g. 411001"
          inputMode="numeric"
          maxLength={6}
          className="rounded-full"
        />
        <Button type="submit" disabled={loading} className="rounded-full gradient-festive border-0 shrink-0">
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Check"}
        </Button>
      </form>
      {error && <div className="mt-2 text-xs text-destructive">{error}</div>}
      {result && (
        <div className="mt-3 text-sm">
          {result.serviceable ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <CheckCircle2 className="size-4" /> Deliverable to {result.city}, {result.state}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Truck className="size-3.5" /> Estimated delivery in {result.etaDays ?? 5} business days
              </div>
              <div className="flex flex-wrap gap-2 text-xs mt-1">
                {result.prepaid && (
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">Prepaid {result.prepaidRate ? "· " + formatINR(result.prepaidRate) : ""}</span>
                )}
                {result.cod && (
                  <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary">COD {result.codRate ? "· " + formatINR(result.codRate) : "available"}</span>
                )}
                {!result.cod && (
                  <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">COD unavailable</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-destructive font-medium">
              <XCircle className="size-4" /> Sorry, this pincode is not serviceable yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
