import { Brand } from "./brand";
import { DataBadge } from "./data-badge";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

/** Cabeçalho único: marca, menu central (sem sidebar), data dos dados e tema. Abaixo de `md` o menu vira um botão
 * ao lado do tema, e o cabeçalho fica numa linha só. */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 md:grid md:h-16 md:grid-cols-[1fr_auto_1fr] md:py-0">
        <Brand />
        <MainNav className="hidden md:flex md:justify-self-center" />
        <div className="flex items-center justify-end gap-2 md:justify-self-end">
          <DataBadge />
          <ThemeToggle />
          <MobileNav className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
