import { Metadata } from "next/types";

import { PropsWithChildren } from "react";

export const metadata: Metadata = {
	title: "Admin | IrvineHacks 2024",
};

function Layout({ children }: PropsWithChildren) {
	return <div style={{ color: "red" }}>{children}</div>;
}

export default Layout;
