import { PropsWithChildren, Suspense } from "react";
import Footer from "@/lib/components/Footer/Footer";

import type { Metadata } from "next";

import NavbarParent from "@/lib/components/Navbar/NavbarParent";
import BaseNavbar from "@/lib/components/Navbar/BaseNavbar";

import "./globals.css";

const title = "IrvineHacks 2026";
const description =
	"IrvineHacks is Hack at UCI's premier hackathon for collegiate students.";

export const metadata: Metadata = {
	title,
	description,
	metadataBase: new URL("https://irvinehacks.com"),

	openGraph: {
		title,
		description,
		siteName: "IrvineHacks",
		images: [
			{
				url: "/social-preview.png",
				alt: title,
			},
		],
		type: "website",
	},

	twitter: {
		card: "summary_large_image",
		title,
		description,
		images: ["/social-preview.png"],
	},
};

export default function Layout({ children }: PropsWithChildren) {
	return (
		<div className="overflow-x-hidden bg-top bg-repeat-y bg-[length:100%] relative">
			<Suspense fallback={<BaseNavbar />}>
				<NavbarParent />
			</Suspense>
			{children}
			{/* <Footer /> */}
			<Footer />
		</div>
	);
}
