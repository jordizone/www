"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Drawer } from "@base-ui/react/drawer";

// The travel <article> elements live as hidden Astro DOM (#td-holder) so their
// nested islands (PhotoStack) hydrate the normal way. This drawer takes NO
// slotted children — that avoids Astro's `await-children` hydration stall — and
// instead MOVES the matching article into its scroll container on open.
export default function TravelDrawer() {
  const [open, setOpen] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      const mount = mountRef.current;
      const holder = document.getElementById("td-holder");
      if (!mount || !holder) return;
      // return whatever is currently shown, then bring in the requested article
      while (mount.firstChild) holder.appendChild(mount.firstChild);
      const article = document.getElementById("travel-" + slug);
      if (article) mount.appendChild(article);
      setOpen(true);
    };
    window.addEventListener("travel:open", onOpen);
    return () => window.removeEventListener("travel:open", onOpen);
  }, []);

  // Let the page hide the map's own back button while the drawer is open.
  useEffect(() => {
    document.documentElement.dataset.travelDrawer = open ? "open" : "";
  }, [open]);

  // On close, park the article back in the hidden holder (keeps it hydrated).
  useEffect(() => {
    if (open) return;
    const mount = mountRef.current;
    const holder = document.getElementById("td-holder");
    if (mount && holder) while (mount.firstChild) holder.appendChild(mount.firstChild);
  }, [open]);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} snapPoints={[0.96]}>
      <Drawer.Portal keepMounted>
        <Drawer.Backdrop className="td-backdrop" />
        <Drawer.Viewport className="td-viewport">
          <Drawer.Popup
            className="td-popup"
            style={{ "--top-margin": "0.5rem" } as CSSProperties}
          >
            <div className="td-draghandle">
              <Drawer.Close className="td-back" aria-label="Back to map">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                map
              </Drawer.Close>
              <div className="td-handle" />
              <Drawer.Title className="sr-only">Travel</Drawer.Title>
            </div>
            <Drawer.Content className="td-scroll">
              <div ref={mountRef} className="td-articles" />
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
