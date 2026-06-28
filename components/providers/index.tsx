"use client";

import { PropsWithChildren } from "react";

import { Toaster } from "../ui/sonner";

import { ThemeProvider } from "./theme-provider";

function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}

export default Providers;
