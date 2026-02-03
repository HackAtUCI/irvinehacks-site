import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";

import ResourcePageBackground from "@/assets/backgrounds/resources-page-bg.png";
import ResourceSection from "./components/ResourceSection";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Resources | IrvineHacks 2025",
};

export default async function Resources() {
	if (process.env.MAINTENANCE_MODE_RESOURCES) {
		redirect("/");
	}

	return (
		<>
			<section className="bg-[#00001c]">
				<div className="relative z-10 min-h-screen">
					<div className="my-36 text-center">
						<h1 className="font-heading text-yellow mb-2 [text-shadow:0_0_25px_#E5F200] text-4xl md:text-5xl lg:text-6xl">
							Resources
						</h1>
					</div>
					<div className="mx-4 mb-40">
						<ResourceSection />
					</div>
				</div>
				<div className="min-h-screen absolute top-0 left-0 w-full h-full overflow-hidden">
					<Image
						src={ResourcePageBackground}
						alt="resource page background"
						className="bg-[#00001c] blur-sm"
						fill
					/>
				</div>
			</section>
		</>
	);
}
