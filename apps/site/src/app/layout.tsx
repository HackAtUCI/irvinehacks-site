import type { Metadata } from "next";
import water from "@/assets/backgrounds/water.jpg";
import Footer from "@/lib/components/Footer/Footer";
import "./globals.css";
import Apply from "./apply/page";

import { Layout } from "@/components/dom/Layout";

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
				<Layout>{children}</Layout>
				<Apply />
				<Footer />
			</body>
		</html>
	);
}
