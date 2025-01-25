import { Metadata } from "next";
import { redirect } from "next/navigation";
import ResourceSection from "./components/ResourceSection";
import resource_header_bg from "../../../assets/backgrounds/resources-header-background.png";
import brick_bg from "../../../assets/backgrounds/brick_bg.png";
import Image from "next/image";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Resources | IrvineHacks 2025",
};

export default function Resources() {
	if (process.env.MAINTENANCE_MODE_RESOURCES) {
		redirect("/");
	}

	return (
		<section className="relative w-full min-h-screen overflow-hidden bg-black">
			<div className="absolute inset-0 bg-black z-[-20]" />

			<div className="relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex flex-col items-center justify-center overflow-hidden z-10">
				<Image
					src={resource_header_bg}
					alt="IrvineHacks 2025 Resources header"
					fill
					className="object-cover object-top"
					priority
				/>
			</div>

			<div className="text-center pt-8 pb-8 z-10">
				<h1 className="mb-2 font-display font-bold text-4xl md:text-5xl">
					Resources
				</h1>
			</div>
			<div className="relative w-full z-0">
				<div className="absolute bottom-0 left-0 w-full h-[50vh] z-[-10]">
					<Image
						src={brick_bg}
						alt="Dark brick background"
						fill
						className="object-cover object-top"
					/>
				</div>
				<div className="relative mx-4 pb-16 z-10">
					<ResourceSection />
				</div>
			</div>
		</section>
	);
}
