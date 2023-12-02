import type { Metadata } from "next";
import "./globals.css";

import { Layout } from "@/components/dom/Layout";
import Navbar from "@/lib/components/Navbar/Navbar";

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
			<body className="overflow-y-hidden overflow-x-hidden">
				{/* reference: https://github.com/pmndrs/react-three-next */}
				<Navbar/>
				<Layout>{children}</Layout>
			</body>
		</html>
	);
}
