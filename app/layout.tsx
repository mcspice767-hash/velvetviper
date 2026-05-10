import type { ReactNode } from "react";

export const metadata = {
  title: "VelvetViper",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", background: "#0a0a0a", color: "#e8e0d0", fontFamily: "'Georgia', serif" }}>
        {children}
      </body>
    </html>
  );
}
