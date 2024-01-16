import { ReactNode } from "react";

import { isAdminRole } from "@/lib/admin/adminRole";
import getUserIdentity from "@/lib/utils/getUserIdentity";

import styles from "./Portal.module.scss";

// TODO: include separate portals for Mentors and Volunteers
interface PortalLayoutProps {
	admin: ReactNode;
	applicant: ReactNode;
}

async function PortalLayout({ admin, applicant }: PortalLayoutProps) {
	const { role } = await getUserIdentity();
	const content = isAdminRole(role) ? admin : applicant;

	return (
		<section className="w-full flex items-center flex-col min-h-screen">
			<div className="m-24">
				<h1
					className={`${styles.title} font-display sm:text-[3rem] text-[#fffce2] text-6xl text-center`}
				>
					Portal
				</h1>
			</div>
			{content}
		</section>
	);
}

export default PortalLayout;
