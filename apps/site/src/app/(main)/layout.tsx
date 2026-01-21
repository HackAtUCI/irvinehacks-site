import { PropsWithChildren, Suspense } from "react";
import Footer from "@/lib/components/Footer/Footer";

import type { Metadata } from "next";

import stars from "@/assets/backgrounds/starry_repeatable.png";
import NavbarParent from "@/lib/components/Navbar/NavbarParent";
import BaseNavbar from "@/lib/components/Navbar/BaseNavbar";

import "./globals.css";

export const metadata: Metadata = {
	title: "IrvineHacks 2025",
	description:
		"IrvineHacks is Hack at UCI's premier hackathon for collegiate students.",
};

export default function Layout({ children }: PropsWithChildren) {
	return (
		<div
			style={{ backgroundImage: `url(${stars.src})` }}
			className="overflow-x-hidden bg-top bg-repeat-y bg-[length:100%] relative"
		>
			<Suspense fallback={<BaseNavbar />}>
				<NavbarParent />
			</Suspense>
			{children}
			{/* <Footer /> */}
			<Footer />
		</div>
	);
}
