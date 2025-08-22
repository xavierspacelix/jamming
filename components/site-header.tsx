"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./theme-toggle";
import { Github, Link } from "lucide-react";
import { deleteCookie } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Documents</h1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <Button variant="outline" size="icon" asChild className="sm:flex">
            <a
              href="https://github.com/xavierspacelix"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              <Github />
            </a>
          </Button>
          <Button variant="outline" size="sm" className=" sm:flex" asChild>
            <a
              onClick={() => {
                deleteCookie("roomCode");
                deleteCookie("guestName");
                deleteCookie("hostName");
              }}
            >
              Change Room
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
