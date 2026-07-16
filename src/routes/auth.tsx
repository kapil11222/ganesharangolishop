import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Ganesha Rangoli" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const signin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back!"); navigate({ to: "/account" }); }
  };
  const signup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/account" : undefined,
        data: { full_name: form.name, phone: form.phone },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Account created! Check your inbox."); navigate({ to: "/account" }); }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined" ? window.location.origin + "/account" : undefined,
      },
    });
    if (error) toast.error(error.message);
  };


  return (
    <SiteLayout>
      <div className="container-luxe py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:block">
          <div className="text-xs uppercase tracking-[0.3em] text-primary font-semibold flex items-center gap-2">
            <Sparkles className="size-4" /> Join the Family
          </div>
          <h1 className="font-display text-5xl font-bold mt-3 leading-tight">
            Save your favourites,<br /><span className="gradient-text">track every order</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-md">
            Create a free account to unlock wishlist, faster checkout, exclusive offers and early access to festive drops.
          </p>
          <div className="mt-8 grid gap-3 text-sm max-w-md">
            {["10% off your first order", "Save unlimited items to wishlist", "Order tracking & invoices", "Exclusive festival drops"].map((b) => (
              <div key={b} className="flex items-center gap-2"><span className="size-5 rounded-full gradient-festive grid place-items-center text-[10px]">✓</span> {b}</div>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-8 shadow-luxe max-w-md w-full mx-auto">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full glass">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={signin} className="space-y-4">
                <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Password</Label><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <Button type="submit" disabled={loading} className="w-full h-11 rounded-full gradient-festive border-0 shadow-glow">{loading ? "..." : "Sign in"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={signup} className="space-y-4">
                <div><Label>Full Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Phone</Label><Input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <Button type="submit" disabled={loading} className="w-full h-11 rounded-full gradient-festive border-0 shadow-glow">{loading ? "..." : "Create account"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SiteLayout>
  );
}
