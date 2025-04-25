import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
	DeploymentInstanceInitialized,
	FrontendDeploymentProvider,
} from "@snipextt/wacht";
import { headers } from "next/headers";

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

// Server-side function to generate the public key
function generatePublicKey(host: string) {
	if (!host.startsWith("accounts")) throw new Error(`Invalid host: ${host}`);
	const deploymentId = host.split(".")[0];
	const backendUrl = host.split(".").slice(1).join(".");

	if (backendUrl.includes("wacht.tech")) {
		return `pk_test_${btoa(`${deploymentId}.backend-api.services`)}`;
	} else {
		return `pk_test_${btoa(`fapi.${backendUrl}`)}`;
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
		const host = headersList.get("host") || "";
		console.log("host", host);
		publicKey = generatePublicKey(host);
	} catch (error) {
		console.error("Error generating public key:", error);
	}

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
