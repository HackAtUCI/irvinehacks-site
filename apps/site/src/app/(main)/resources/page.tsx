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

export default async function Resources() {
	if (process.env.MAINTENANCE_MODE_RESOURCES) {
		redirect("/");
	}

	return (
		<>
			<section className="w-full h-full mb-12">
				<div className="absolute top-[75%] left-0 w-full h-[calc(100%-75%)] min-h-[25vh] z-[-10]">
					<Image
						src={brick_bg}
						alt="Brick Background"
						fill
						className="object-cover object-top"
						priority
					/>
				</div>

				<div className="relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
					<Image
						src={resource_header_bg}
						alt="Resources Header Background"
						fill
						className="object-cover object-top z-10"
						priority
					/>
				</div>
				<div className="text-center pt-8 pb-8">
					<h1 className="mb-2 font-display font-bold text-4xl md:text-5xl">
						Resources
					</h1>
				</div>

				<div className="mx-4 mb-40">
					<ResourceSection />
				</div>
			</section>
		</>
	);
}