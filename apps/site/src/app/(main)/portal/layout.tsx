import { ReactNode } from "react";

import styles from "./Portal.module.scss";

interface PortalLayoutProps {
	applicant: ReactNode;
}

function PortalLayout({ applicant }: PortalLayoutProps) {
	return (
		<section className=" w-full flex items-center flex-col min-h-screen">
			<div className="m-24">
				<h1
					className={`${styles.title} font-display sm:text-[3rem] text-[#fffce2] text-6xl text-center`}
				>
					Portal
				</h1>
			</div>
			{applicant}
		</section>
	);
}

export default PortalLayout;
