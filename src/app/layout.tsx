import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "RiftEdge - LoL Pick Assistant",
  description: "Find the best counter picks for League of Legends. Select the enemy champion and get matchup win rates to dominate your lane.",
  keywords: ["League of Legends", "counter pick", "matchup", "win rate", "LoL", "draft"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
