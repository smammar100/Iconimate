"use client";

import { useEffect, useState } from "react";
import { Provider } from "@react-spectrum/s2/Provider";

type Scheme = "light" | "dark";

/**
 * Client boundary for the S2 Provider. Seeded with the server-resolved scheme,
 * then keeps S2's color scheme in sync with the document theme (so native controls
 * like the ⌘K input caret and scrollbars match the toggle).
 */
export function AppProvider({
  children,
  initialColorScheme,
}: {
  children: React.ReactNode;
  initialColorScheme: Scheme;
}) {
  const [scheme, setScheme] = useState<Scheme>(initialColorScheme);

  useEffect(() => {
    const read = () =>
      setScheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  return (
    <Provider background="base" colorScheme={scheme} locale="en-US">
      {children}
    </Provider>
  );
}
