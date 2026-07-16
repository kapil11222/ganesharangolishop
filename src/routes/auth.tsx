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
          <Button
            type="button"
            onClick={signInWithGoogle}
            variant="outline"
            className="w-full h-11 rounded-full mb-4 gap-2 bg-background/60 hover:bg-background"
          >
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.75-6-6.15S8.7 5.9 12 5.9c1.88 0 3.15.8 3.87 1.5l2.64-2.55C16.87 3.35 14.65 2.4 12 2.4 6.86 2.4 2.7 6.55 2.7 11.7S6.86 21 12 21c6.94 0 8.87-4.85 8.87-8.05 0-.54-.06-.95-.13-1.35H12z"/>
            </svg>
            Continue with Google
          </Button>
          <div className="relative mb-4 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <span className="relative px-3 text-xs text-muted-foreground bg-card">or</span>
          </div>
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
