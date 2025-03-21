import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
	const hostname = req.nextUrl.hostname;

	try {
		if (hostname.includes("/") || hostname.includes("\\")) {
			return new NextResponse("Invalid hostname", { status: 400 });
		}

		const content = await axios.get(
			`https://api.cloudflare.com/client/v4/zones/c1ffb7b7ca71b155b03b649575ba9e85/custom_hostnames?hostname=${hostname}`,
			{
				headers: {
					"X-Auth-Email": process.env.CF_EMAIL,
					"X-Auth-Key": process.env.CF_API_KEY,
				},
			},
		);

		return new NextResponse(
			content.data.result[0].ownership_verification_http?.http_body,
			{
				headers: {
					"Content-Type": "text/plain",
				},
			},
		);
	} catch (error) {
		console.error("Error serving ACME challenge:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
