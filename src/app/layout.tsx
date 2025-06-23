import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import {
  DeploymentProvider,
  DeploymentInitialized,
} from "@snipextt/wacht-nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function generatePublicKey(host: string) {
  const slug = host.split(".")[0];
  const backendUrl = host.split(".").slice(1).join(".");

  if (backendUrl.includes("wacht.tech")) {
    return `pk_test_${btoa(`https://${slug}.frontend-api.services`)}`;
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
    <html lang="en">
      <head></head>
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
