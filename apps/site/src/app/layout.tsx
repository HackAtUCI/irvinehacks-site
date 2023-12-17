import type { Metadata } from "next";
import water from "@/assets/backgrounds/water.jpg";
import Footer from "@/lib/components/Footer/Footer";
import "./globals.css";

import { Layout } from "@/components/dom/Layout";
import Navbar from "@/lib/components/Navbar/Navbar";
import ApplyConfirm from "./apply-confirm/page";

export const metadata: Metadata = {
	title: "IrvineHacks 2024",
	description:
		"IrvineHacks is Hack at UCI's premier hackathon for collegiate students.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				style={{
					backgroundImage: `url(${water.src})`,
				}}
				className="overflow-x-hidden bg-top bg-repeat-y bg-[length:100%]"
			>
				{/* reference: https://github.com/pmndrs/react-three-next */}
				<Navbar />
				{/* <Layout>{children}</Layout> */}
				<ApplyConfirm />
				<Footer />
			</body>
		</html>
	);
}
