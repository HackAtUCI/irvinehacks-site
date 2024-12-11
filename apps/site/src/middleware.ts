import { Logger } from "next-axiom";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

export async function middleware(request: NextRequest, event: NextFetchEvent) {
	if (process.env.VERCEL_ENV === "production") {
		const logger = new Logger({ source: "middleware" }); // traffic, request
		await logger.middleware(request, { logRequestDetails: ["body"] });

		event.waitUntil(logger.flush());
	}
	return NextResponse.next();
}
