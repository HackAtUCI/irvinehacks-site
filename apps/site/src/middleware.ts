import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_HACKATHONS = new Set(["irvinehacks", "zothacks"]);

export function middleware(request: NextRequest) {
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

	let hackathon = "irvinehacks";
	if (isAdminApi) {
		const selected = request.cookies.get("hackathon")?.value;
		if (selected && ALLOWED_HACKATHONS.has(selected)) {
			hackathon = selected;
		}
	}

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("X-Hackathon-Name", hackathon);

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
}

export const config = {
	matcher: ["/api/:path*"],
};
