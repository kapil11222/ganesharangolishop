import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, BellPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import type { OfferCampaign } from "@/lib/offers";

/** "Notify me" for an upcoming sale — stores interest for the signed-in user. */
export function SaleReminderButton({ campaign, className = "" }: { campaign: OfferCampaign; className?: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: set = false } = useQuery({
    queryKey: ["offer-reminder", campaign.id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("offer_reminders")
        .select("id")
        .eq("campaign_id", campaign.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      return !!data;
    },
  });

  const click = async () => {
    if (!user) {
      toast.info("Sign in to get a reminder before the sale starts.");
      return;
    }
    if (set) {
      toast.success("You're already on the reminder list 🔔");
      return;
    }
    const { error } = await supabase
      .from("offer_reminders")
      .insert({ campaign_id: campaign.id, user_id: user.id });
    if (error) toast.error(error.message);
    else {
      toast.success("We'll remind you when the sale starts 🔔");
      qc.invalidateQueries({ queryKey: ["offer-reminder", campaign.id, user.id] });
    }
  };

  return (
    <button
      type="button"
      onClick={click}
      className={`inline-flex items-center gap-1.5 rounded-full border border-current/40 bg-primary-foreground/15 px-3 py-1.5 text-xs font-bold hover:bg-primary-foreground/25 transition ${className}`}
    >
      {set ? <BellRing className="size-3.5" /> : <BellPlus className="size-3.5" />}
      {set ? "Reminder set" : "Notify me"}
    </button>
  );
}
