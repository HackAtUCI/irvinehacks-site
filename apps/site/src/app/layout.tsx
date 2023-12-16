import type { Metadata } from "next";
import water from "@/assets/backgrounds/water.jpg";
import App from "./App";
import "./globals.css";

export const metadata: Metadata = {
	title: "IrvineHacks 2024",
	description:
		"IrvineHacks is Hack at UCI's premier hackathon for collegiate students.",
};

export default async function RootLayout({
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
				<App>{children}</App>
			</body>
		</html>
	);
}
