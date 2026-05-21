import { PropsWithChildren } from "react";

import heroFried from "@/assets/backgrounds/hero-fried.png";

function PortalPreviewLayout({ children }: PropsWithChildren) {
	return (
		<section
			className="w-full flex items-center flex-col min-h-screen bg-cover bg-center bg-no-repeat relative"
			style={{ backgroundImage: `url(${heroFried.src})` }}
		>
			<div className="absolute inset-0 backdrop-blur-[4px]" />
			<div className="relative z-10 mt-20 md:mt-36 md:mb-10">
				<h1
					className="font-display font-bold text-3xl sm:text-5xl md:text-7xl text-center text-[var(--color-yellow)]"
					style={{ textShadow: "0px 0px 25px rgba(229, 242, 0, 1)" }}
				>
					Portal Preview
				</h1>
			</div>
			<div className="relative z-10">{children}</div>
		</section>
	);
}

export default PortalPreviewLayout;
