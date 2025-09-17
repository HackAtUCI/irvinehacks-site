import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED = new Set(["irvinehacks", "zothacks"]);

export function middleware(request: NextRequest) {

	const { pathname } = request.nextUrl;
	const isAdminApi = pathname.startsWith("/admin");

	let hackathon = "irvinehacks"; 
	if (isAdminApi) {
		const selected = request.cookies.get("hackathon")?.value;
		if (selected && ALLOWED.has(selected)) {
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
