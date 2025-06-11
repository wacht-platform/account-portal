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
  const deploymentId = host.split(".")[0];
  const backendUrl = host.split(".").slice(1).join(".");

  if (backendUrl.includes("wacht.tech")) {
    return `pk_test_${btoa(`https://${deploymentId}.backend-api.services`)}`;
  } else {
    return `pk_test_${btoa(`https://fapi.${backendUrl}`)}`;
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
    console.log("headersList", headersList);
    const host = headersList.get("host") || "";
    console.log("host", host);
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
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DeploymentInitialized>{children}</DeploymentInitialized>
          </ThemeProvider>
        </body>
      </html>
    </DeploymentProvider>
  );
}
