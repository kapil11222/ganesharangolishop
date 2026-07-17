import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

export function PincodeGate() {
  const [open, setOpen] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("pincode")
        .eq("id", userId)
        .maybeSingle();
      if (!mounted) return;
      if (!data?.pincode) {
        setUid(userId);
        setOpen(true);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) check(u.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user) {
        check(session.user.id);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const save = async () => {
    if (!/^[0-9]{6}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    if (!uid) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ pincode })
      .eq("id", uid);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Default pincode saved!");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && pincode.length !== 6) return; setOpen(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto size-14 rounded-full gradient-festive grid place-items-center shadow-glow mb-2">
            <MapPin className="size-6 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">Set your default pincode</DialogTitle>
          <DialogDescription className="text-center">
            We'll use this to check delivery & COD availability and pre-fill your checkout. You can change it anytime from your account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Delivery Pincode *</Label>
          <Input
            inputMode="numeric"
            placeholder="e.g. 110001"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            maxLength={6}
            className="text-center text-lg tracking-widest font-semibold h-12 rounded-2xl"
          />
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={saving || pincode.length !== 6} className="w-full h-11 rounded-full gradient-festive border-0 shadow-glow">
            {saving ? "Saving…" : "Save Pincode"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
