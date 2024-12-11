import { PropsWithChildren } from "react";

import { AxiomWebVitals } from "next-axiom";

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<AxiomWebVitals />
			<body>{children}</body>
		</html>
	);
}
