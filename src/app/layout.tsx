import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import {
  DeploymentProvider,
  DeploymentInitialized,
} from "@snipextt/wacht-nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";
import { console } from "inspector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

function generatePublicKey(host: string) {
  const slug = host.split(".")[0];
  const backendUrl = host.split(".").slice(1).join(".");

  if (backendUrl.includes("wacht.tech")) {
    return `pk_test_${btoa(`https://${slug}.frontend-api.services`)}`;
  } else {
    return `pk_live_${btoa(`https://frontend.${backendUrl}`)}`;
  }
}

type Meta = {
  app_name: string;
  favicon_image_url: string;
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const headersList = await headers();
    const host =
      headersList.get("x-forwarded-host") || headersList.get("host") || "";
    console.log("host", host);

    const meta: { data: Meta } = await fetch(
      `https://${host}/.well-known/meta`
    ).then((res) => res.json());

    return {
      title: `Accounts Portal | ${meta.data.app_name}`,
      icons: [{ url: meta.data.favicon_image_url }],
    };
  } catch (error) {
    console.error("Error generating public key:", error);
    return {
      title: "Accounts Portal",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let publicKey = "";

  try {
    const headersList = await headers();
    const host =
      headersList.get("x-forwarded-host") || headersList.get("host") || "";
    publicKey = generatePublicKey(host);
  } catch (error) {
    console.error("Error generating public key:", error);
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>
          <ThemeProvider>
            <DeploymentProvider publicKey={publicKey}>
              <DeploymentInitialized>{children}</DeploymentInitialized>
            </DeploymentProvider>
          </ThemeProvider>
        </main>
      </body>
    </html>
  );
}
