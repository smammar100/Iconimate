"use client";

import { useEffect, useState } from "react";
import { Provider } from "@react-spectrum/s2/Provider";
import { MotionConfig } from "motion/react";

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
    // Light is the documented default: only an explicit "dark" flips the scheme.
    const read = () =>
      setScheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  return (
    <Provider background="base" colorScheme={scheme} locale="en-US">
      {/* All Motion-driven animation honors the OS reduced-motion setting. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </Provider>
  );
}
