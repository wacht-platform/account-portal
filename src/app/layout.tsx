import type { Metadata, ResolvingMetadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DeploymentInitialized, DeploymentProvider } from "@snipextt/wacht";
import { headers } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return {
    title: "Wacht Account Portal",
    description: "Manage your Wacht account and settings",
  };
}

function generatePublicKey(host: string) {
  const backendUrl = host.split(".").slice(1).join(".");

  if (backendUrl.includes("wacht.tech")) {
    return `pk_test_${btoa(`https://${host}`)}`;
  } else {
    return `pk_live_${btoa(`https://frontend.${backendUrl}`)}`;
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
    <DeploymentProvider publicKey={publicKey}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/api/favicon" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            enableSystem={false}
            disableTransitionOnChange
          >
            <DeploymentInitialized>{children}</DeploymentInitialized>
          </ThemeProvider>
        </body>
      </html>
    </DeploymentProvider>
  );
}
