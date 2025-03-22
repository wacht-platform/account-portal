import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const type = searchParams.get("type") || "default";

	let iconPath: string;

	switch (type) {
		case "alternative":
			iconPath = path.join(process.cwd(), "public", "globe.svg");
			break;
		default:
			iconPath = path.join(process.cwd(), "src", "app", "favicon.ico");
			break;
	}

	try {
		const fileBuffer = readFileSync(iconPath);

		const contentType = iconPath.endsWith(".ico")
			? "image/x-icon"
			: iconPath.endsWith(".svg")
				? "image/svg+xml"
				: "image/png";

		return new NextResponse(fileBuffer, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=86400",
			},
		});
	} catch (error) {
		console.error("Error serving favicon:", error);
		return new NextResponse(null, { status: 404 });
	}
}
