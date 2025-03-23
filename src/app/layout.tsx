import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
	DeploymentInstanceInitialized,
	FrontendDeploymentProvider,
} from "@snipextt/wacht";
import { useEffect, useState } from "react";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Record<string, string>;
	searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
	return {
		title: "Wacht Account Portal",
		description: "Manage your Wacht account and settings",
	};
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [publicKey, setPublicKey] = useState<string>("");

	useEffect(() => {
		if (typeof window !== "undefined") {
			const url = window.location.href;
			if (!url.startsWith("accounts")) throw new Error(`Invalid URL: ${url}`);
			const backendUrl = url.split(".").slice(1).join(".");
			setPublicKey(`pk_${btoa(`fapi.${backendUrl}`)}`);
		}
	}, []);

	return (
		<FrontendDeploymentProvider publicKey={publicKey}>
			<html lang="en">
				<head>
					<link rel="icon" href="/api/favicon" />
				</head>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				>
					<DeploymentInstanceInitialized>
						{children}
					</DeploymentInstanceInitialized>
				</body>
			</html>
		</FrontendDeploymentProvider>
	);
}
