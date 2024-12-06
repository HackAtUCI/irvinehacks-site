import { PropsWithChildren } from "react";

import type { Metadata } from "next";

import SceneLayout from "@/components/dom/SceneLayout";
import Footer from "@/lib/components/Footer/Footer";
import NavbarParent from "@/lib/components/Navbar/NavbarParent";
import stars from "@/assets/backgrounds/starry_repeatable.png";

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
			className="overflow-x-hidden bg-top bg-repeat-y bg-[length:100%]"
		>
			{/* reference: https://github.com/pmndrs/react-three-next */}
			<NavbarParent />
			<SceneLayout>{children}</SceneLayout>
			{/* <Footer /> */}
		</div>
	);
}
