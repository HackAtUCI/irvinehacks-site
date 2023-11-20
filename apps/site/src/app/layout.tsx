import type { Metadata } from "next";
import "./globals.css";

import water from "./water.png";
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
			</body>
		</html>
	);
}
