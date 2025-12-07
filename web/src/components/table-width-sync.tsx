"use client";

import { useEffect } from "react";

export function TableWidthSync({ wrapperSelector = ".table-wrapper" }: { wrapperSelector?: string }) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const getWrappers = () => Array.from(document.querySelectorAll<HTMLElement>(wrapperSelector));

    const computeWidth = () => {
      const viewport = window.visualViewport?.width ?? document.documentElement.clientWidth ?? window.innerWidth ?? 0;
      if (viewport <= 768) {
        return Math.max(viewport - 48, 0);
      }
      return null;
    };

    const apply = () => {
      const targetWidth = computeWidth();
      getWrappers().forEach((wrapper) => {
        const table = wrapper.querySelector<HTMLTableElement>("table");
        if (targetWidth !== null) {
          wrapper.style.width = "100%";
          wrapper.style.maxWidth = `${targetWidth}px`;
          if (table) {
            table.style.width = `${targetWidth}px`;
            table.style.maxWidth = "100%";
          }
        } else {
          wrapper.style.removeProperty("width");
          wrapper.style.removeProperty("maxWidth");
          if (table) {
            table.style.removeProperty("width");
            table.style.removeProperty("maxWidth");
          }
        }
      });
    };

    apply();

    const handleResize = () => apply();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [wrapperSelector]);

  return null;
}
