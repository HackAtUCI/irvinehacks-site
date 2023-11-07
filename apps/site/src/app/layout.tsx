import type { Metadata } from "next";
import "./globals.css";

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
			<body>
				{/* reference: https://github.com/pmndrs/react-three-next */}
				<Layout>{children}</Layout>
			</body>
		</html>
	);
}
