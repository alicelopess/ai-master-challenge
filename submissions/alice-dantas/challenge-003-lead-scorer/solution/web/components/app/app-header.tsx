import { Brand } from "./brand";
import { DataBadge } from "./data-badge";
import { MainNav } from "./main-nav";
import { ThemeToggle } from "./theme-toggle";

/** Cabeçalho único: marca, menu central (sem sidebar), data dos dados e tema. No mobile o menu desce para a
 * segunda linha. */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 md:h-16 md:grid-cols-[1fr_auto_1fr] md:py-0">
        <Brand />
        <div className="flex items-center justify-end gap-2 md:order-3">
          <DataBadge />
          <ThemeToggle />
        </div>
        <MainNav className="col-span-2 justify-self-center md:order-2 md:col-span-1" />
      </div>
    </header>
  );
}
