import { PropsWithChildren } from "react";

import type { Metadata } from "next";

import water from "@/assets/backgrounds/water.jpg";
import SceneLayout from "@/components/dom/SceneLayout";
import Footer from "@/lib/components/Footer/Footer";
import NavbarParent from "@/lib/components/Navbar/NavbarParent";

import "./globals.css";

export const metadata: Metadata = {
	title: "IrvineHacks 2024",
	description:
		"IrvineHacks is Hack at UCI's premier hackathon for collegiate students.",
};

export default function Layout({ children }: PropsWithChildren) {
	return (
		<div
			style={{ backgroundImage: `url(${water.src})` }}
			className="overflow-x-hidden bg-top bg-repeat-y bg-[length:100%]"
		>
			{/* reference: https://github.com/pmndrs/react-three-next */}
			<NavbarParent />
			<SceneLayout>{children}</SceneLayout>
			{/* <Footer /> */}
		</div>
	);
}
