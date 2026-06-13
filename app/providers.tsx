"use client";

import { Provider } from "@react-spectrum/s2/Provider";

/**
 * Client boundary for the S2 Provider. The "Dark Command" page paints its own
 * true-black surface on top, but we pin the S2 color scheme to dark so anything
 * S2 still touches (base page.css) aligns with the design instead of flashing light.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider background="base" colorScheme="dark" locale="en-US">
      {children}
    </Provider>
  );
}
