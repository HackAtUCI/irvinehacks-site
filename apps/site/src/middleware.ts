import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_HACKATHONS = new Set(["irvinehacks", "zothacks"]);

export function middleware(request: NextRequest) {
	console.log(
		"Incoming X-Hackathon-Name:",
		request.headers.get("X-Hackathon-Name"),
	);
	const referer = request.headers.get("referer") || "";
	let pathname = "";

	if (referer) {
		try {
			const refererUrl = new URL(referer);
			pathname = refererUrl.pathname;
		} catch (error) {
			console.error("Invalid referer URL:", referer);
		}
	}

	const isAdminApi = pathname.startsWith("/admin");

	let hackathon = request.headers.get("X-Hackathon-Name") || "irvinehacks";
	if (isAdminApi) {
		const selected = request.cookies.get("hackathon")?.value;
		if (selected && ALLOWED_HACKATHONS.has(selected)) {
			hackathon = selected;
		}
	}

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("X-Hackathon-Name", hackathon);
	console.log("Outgoing X-Hackathon-Name:", hackathon);
	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
}

export const config = {
	matcher: ["/api/:path*"],
};
