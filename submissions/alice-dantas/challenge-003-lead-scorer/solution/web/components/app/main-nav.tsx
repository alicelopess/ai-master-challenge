"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { NAV, UI } from "@/copy/pt-BR";
import { NAV_ITEMS, isActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <NavigationMenu viewport={false} aria-label={UI.navLabel} className={className}>
      <NavigationMenuList className="gap-0.5 sm:gap-1">
        {NAV_ITEMS.map((item) => (
          <NavigationMenuItem key={item.key}>
            <NavigationMenuLink
              asChild
              active={isActive(pathname, item.href)}
              className={cn(
                navigationMenuTriggerStyle(),
                "relative px-2 text-[13px] text-muted-foreground sm:px-3 sm:text-sm",
                "data-[active=true]:bg-muted data-[active=true]:text-foreground",
                "after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary",
                "after:opacity-0 data-[active=true]:after:opacity-100 sm:after:inset-x-3",
              )}
            >
              <Link href={item.href}>{NAV[item.key]}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
