import { StrictMode, type ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "../styles.css";
// Araç sayfaları main.tsx yerine bu girişi kullandığı için ortak üst menü
// teması (rv- tokenları, marka, menü, dil seçimi) burada da yüklenir.
import "../home.css";

export function mount(application: ReactNode) {
  const root = document.getElementById("root");
  if (!root) throw new Error("Root mount point was not found.");

  const wrapped = <StrictMode>{application}</StrictMode>;
  if (root.hasChildNodes()) hydrateRoot(root, wrapped);
  else createRoot(root).render(wrapped);
}
