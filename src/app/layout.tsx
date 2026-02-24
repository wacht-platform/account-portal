import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { DeploymentInitialized, DeploymentProvider } from "@wacht/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const dynamic = "force-dynamic";

type Meta = {
    app_name: string;
    favicon_image_url: string;
};

function deriveFrontendApiBase(rawHost: string): string | null {
    const host = rawHost.trim();
    if (!host) return null;

    const slug = host.split(".")[0];
    const backendUrl = host.split(".").slice(1).join(".");
    if (!backendUrl) return null;

    if (backendUrl.includes("trywacht.xyz")) {
        return `https://${slug}.feapis.xyz`;
    }
    return `https://frontend.${backendUrl}`;
}

export async function generateMetadata(): Promise<Metadata> {
    try {
        const headersList = await headers();
        const host =
            headersList.get("x-forwarded-host") ||
            headersList.get("host") ||
            "";
        const frontendApiBase = deriveFrontendApiBase(host);
        if (!frontendApiBase)
            throw new Error("Unable to derive frontend-api base URL");

        const meta: { data: Meta } = await fetch(
            `${frontendApiBase}/.well-known/meta`,
        ).then((res) => res.json());

        return {
            title: `Accounts Portal | ${meta.data.app_name}`,
            icons: [{ url: meta.data.favicon_image_url }],
        };
    } catch (error) {
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
    const headersList = await headers();
    const portalHost =
        headersList.get("x-forwarded-host") || headersList.get("host") || "";
    const frontendApiBase = deriveFrontendApiBase(portalHost) || "";
    const publicKey = frontendApiBase
        ? `pk_test_${Buffer.from(frontendApiBase).toString("base64")}`
        : "";

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <main>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <DeploymentProvider publicKey={publicKey}>
                            <DeploymentInitialized>
                                {children}
                            </DeploymentInitialized>
                        </DeploymentProvider>
                    </ThemeProvider>
                </main>
            </body>
        </html>
    );
}
