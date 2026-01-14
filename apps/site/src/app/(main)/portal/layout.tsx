import { ReactNode } from "react";

import { hasAdminRole } from "@/lib/admin/authorization";
import getUserIdentity from "@/lib/utils/getUserIdentity";
import heroFried from "@/assets/backgrounds/hero-fried.png";

// TODO: include separate portals for Mentors and Volunteers
interface PortalLayoutProps {
	admin: ReactNode;
	applicant: ReactNode;
}

async function PortalLayout({ admin, applicant }: PortalLayoutProps) {
	const { roles } = await getUserIdentity();
	const content = hasAdminRole(roles) ? admin : applicant;

	return (
		<section
			className="w-full flex items-center flex-col min-h-screen bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: `url(${heroFried.src})` }}
		>
			<div className="mt-20 md:mt-36 md:mb-10">
				<h1 className="font-display font-bold text-3xl sm:text-5xl md:text-7xl text-center text-[var(--color-yellow)]">
					Portal
				</h1>
			</div>
			{content}
		</section>
	);
}

export default PortalLayout;
