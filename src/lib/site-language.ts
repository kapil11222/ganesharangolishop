// Whole-site translation via Google Website Translator (covers every page, incl. policies & dynamic content).
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "mr", label: "मराठी (Marathi)" },
] as const;

export function getCurrentLanguage(): string {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-z-]+)/i);
  return m?.[1] ?? "en";
}

export function setSiteLanguage(code: string) {
  const host = window.location.hostname;
  const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  // clear old cookies on all domain variants
  for (const d of ["", `;domain=${host}`, `;domain=.${host}`]) {
    document.cookie = `googtrans=;${expire};path=/${d}`;
  }
  if (code !== "en") {
    document.cookie = `googtrans=/en/${code};path=/`;
    document.cookie = `googtrans=/en/${code};path=/;domain=.${host}`;
  }
  window.location.reload();
}

let loaded = false;
export function loadTranslator() {
  if (loaded || typeof window === "undefined") return;
  if (getCurrentLanguage() === "en") return;
  loaded = true;
  const w = window as any;
  w.googleTranslateElementInit = () => {
    new w.google.translate.TranslateElement(
      { pageLanguage: "en", includedLanguages: "en,hi,mr", autoDisplay: false },
      "google_translate_element",
    );
  };
  if (!document.getElementById("google_translate_element")) {
    const div = document.createElement("div");
    div.id = "google_translate_element";
    div.style.display = "none";
    document.body.appendChild(div);
  }
  const s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);
}
