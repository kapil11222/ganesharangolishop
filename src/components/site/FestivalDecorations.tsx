import { Link } from "@tanstack/react-router";
import diya from "@/assets/festival-diya.png";
import garba from "@/assets/festival-garba.png";
import rangoli from "@/assets/festival-rangoli.png";
import { THEMES, readTemplate, type ThemeKey } from "@/lib/festival";
import { pickSaleCampaign } from "@/lib/offers";
import { useLiveCampaigns } from "./OfferStrip";

export const festivalArtwork = (theme: ThemeKey) => theme === "navratri" ? garba : theme === "diwali" ? diya : rangoli;
const festivalCopy: Record<ThemeKey, string> = {
  diwali: "Light up your Diwali", navratri: "Nine nights. Endless colour.", holi: "Bring home the colours of Holi",
  "ganesh-chaturthi": "A beautiful welcome for Bappa", "raksha-bandhan": "Celebrate a beautiful bond",
  wedding: "A beautiful beginning", "new-year": "New year. New celebrations.", sale: "A little more colour. A little more joy.",
};

export function FestivalArt({ theme, welcome = false }: { theme: ThemeKey; welcome?: boolean }) {
  return <div className={`festival-art-scene ${welcome ? "festival-art-scene-welcome" : ""}`} aria-hidden="true">
    <img className="festival-art-mandala" src={rangoli} alt="" width={816} height={816} loading={welcome ? "eager" : "lazy"} />
    {theme !== "holi" && <img className="festival-art-symbol" src={festivalArtwork(theme)} alt="" width={816} height={816} loading={welcome ? "eager" : "lazy"} />}
  </div>;
}

export function FestivalShopDecor({ placement }: { placement: "top" | "footer" }) {
  const { data: campaigns = [] } = useLiveCampaigns();
  const c = pickSaleCampaign(campaigns);
  if (!c?.festival_template) return null;
  const tpl = readTemplate(c.festival_template, c.occasion);
  if (placement === "footer") return <div className="festival-closing" aria-hidden="true">
    {[0, 1, 2, 3, 4].map(i => <img key={i} src={i === 2 ? rangoli : festivalArtwork(tpl.theme)} alt="" width={816} height={816} loading="lazy" />)}
  </div>;
  return <section className="festival-celebration" aria-label={`${THEMES[tpl.theme].label} collection`}>
    <div className="festival-toran" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <span key={i}><i /><i /><i /></span>)}</div>
    <div className="container-luxe festival-celebration-inner">
      <FestivalArt theme={tpl.theme} />
      <div className="festival-celebration-copy"><p>{THEMES[tpl.theme].label} at Ganesha Rangoli</p><h2>{festivalCopy[tpl.theme]}</h2><Link to="/shop">Explore the collection <span aria-hidden="true">→</span></Link></div>
      <img className="festival-celebration-end" src={festivalArtwork(tpl.theme)} alt="" width={816} height={816} loading="lazy" />
    </div>
  </section>;
}