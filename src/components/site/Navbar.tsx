import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, Heart, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/lib/cart-store";
import { LANGUAGES, getCurrentLanguage, setSiteLanguage, loadTranslator } from "@/lib/site-language";
const LOGO_URL = "/logo.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/new-arrivals", label: "New" },
  { to: "/best-sellers", label: "Best Sellers" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const count = useCart((s) => s.itemCount());
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setMounted(true);
    setLang(getCurrentLanguage());
    loadTranslator();
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>

      <header data-hook="nav"
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled ? "glass-strong shadow-card" : "bg-transparent"
        }`}
      >
        <div className="container-luxe flex items-center justify-between gap-4 py-3">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={LOGO_URL}
              alt="Ganesha Rangoli"
              className="size-11 md:size-12 rounded-full object-cover shadow-card ring-1 ring-border transition-transform group-hover:scale-105"
            />
            <div className="leading-tight">
              <div className="font-display text-lg md:text-xl font-bold tracking-tight">
                Ganesha <span className="gradient-text">Rangoli</span>
              </div>
              <div className="text-[10px] text-muted-foreground tracking-widest uppercase hidden md:block">
                Ready Rangoli, Ready Joy
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => {
              const active = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-2 text-sm font-medium rounded-full transition-all ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Link to="/shop" aria-label="Search">
              <Button variant="ghost" size="icon" className="rounded-full hidden md:inline-flex">
                <Search className="size-5" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hidden md:inline-flex" aria-label="Language">
                  <Globe className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass notranslate">
                {LANGUAGES.map((l) => (
                  <DropdownMenuItem key={l.code} onClick={() => setSiteLanguage(l.code)} className={lang === l.code ? "text-primary font-semibold" : ""}>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>




            <Link to="/wishlist" aria-label="Wishlist">
              <Button variant="ghost" size="icon" className="rounded-full hidden md:inline-flex">
                <Heart className="size-5" />
              </Button>
            </Link>

            <Link to="/account" aria-label="Account">
              <Button variant="ghost" size="icon" className="rounded-full hidden md:inline-flex">
                <User className="size-5" />
              </Button>
            </Link>

            <Link to="/cart" aria-label="Cart" className="relative">
              <Button variant="default" size="icon" className="rounded-full gradient-festive border-0 shadow-glow">
                <ShoppingBag className="size-5" />
              </Button>
              {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold grid place-items-center shadow">
                  {count}
                </span>
              )}
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="Menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] glass-strong">
                <div className="flex flex-col gap-1 mt-8">
                  {nav.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className="px-4 py-3 rounded-xl font-medium hover:bg-primary/10 hover:text-primary transition"
                    >
                      {n.label}
                    </Link>
                  ))}
                  <div className="h-px bg-border my-2" />
                  <Link to="/wishlist" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl font-medium hover:bg-primary/10">
                    Wishlist
                  </Link>
                  <Link to="/account" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl font-medium hover:bg-primary/10">
                    My Account
                  </Link>
                  <Link to="/track-order" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl font-medium hover:bg-primary/10">
                    Track Order
                  </Link>
                  <Link to="/help" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl font-medium hover:bg-primary/10">
                    Help Center
                  </Link>
                  <div className="h-px bg-border my-2" />
                  <div className="px-4 py-1 text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Globe className="size-3.5" /> Language</div>
                  <div className="flex flex-wrap gap-2 px-4 notranslate">
                    {LANGUAGES.map((l) => (
                      <button key={l.code} onClick={() => setSiteLanguage(l.code)} className={`px-3 py-1.5 rounded-full border text-sm ${lang === l.code ? "border-primary text-primary bg-primary/10" : "border-border"}`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
