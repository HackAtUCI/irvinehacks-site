import { PropsWithChildren } from "react";

import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
	title: "IrvineHacks 2025",
	description:
		"IrvineHacks is Hack at UCI's premier hackathon for collegiate students.",
};

export default function Layout({ children }: PropsWithChildren) {
	return (
		<div
			className="overflow-x-hidden bg-top bg-repeat-y bg-[length:100%] relative"
		>
			{/* <Suspense fallback={<BaseNavbar />}>
				<NavbarParent />
			</Suspense> */}
			{children}
			{/* <Footer /> */}
		</div>
	);
}
