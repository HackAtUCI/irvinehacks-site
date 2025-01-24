import Button from "@/lib/components/Button/Button";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getResources } from "./getResources";
import resource_header_bg from "../../../assets/backgrounds/resources-header-background.png";
import brick_bg from "../../../assets/backgrounds/brick_bg.png";

import Image from "next/image";

export const revalidate = 60;
let count = 0;

export const metadata: Metadata = {
	title: "Resources | IrvineHacks 2025",
};

export default async function Resources() {
	if (process.env.MAINTENANCE_MODE_RESOURCES) {
		redirect("/");
	}

	const resources = await getResources();

	return (
		<>
			<section className="relative min-h-screen w-full flex flex-col">
				
				<div className="absolute top-[75%] left-0 w-full h-[calc(100%-75%)] min-h-[25vh] z-0">
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

					<h1 className="absolute bottom-[5%] text-white text-3xl md:text-4xl lg:text-5xl font-bold z-20">
						Resources
					</h1>
				</div>

				<div className="relative flex-grow mb-40 mx-4 z-10">
					{resources.order.map(({ _id, iconUrl, title, description, resources }, i) => {
						return (
							<div
								key={_id}
								className="relative max-w-5xl w-full mx-auto mb-12 text-[#2F1C00] p-12 rounded-2xl lg:grid lg:gap-20 lg:grid-cols-2 lg:items-center bg-[var(--color-white)] shadow-lg z-20"
							>
								<div className="relative z-10">
									<div className="flex gap-2 lg:flex-col">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img className="w-8 h-auto lg:w-16" src={iconUrl} alt="" />
										<h2 className="text-2xl font-bold">{title}</h2>
									</div>
									<p>{description}</p>
								</div>
								<div className="relative z-10 flex flex-col gap-3 lg:gap-4">
									{resources.map(({ _id, title, link }) => (
										<Button
											key={_id}
											text={title}
											href={link}
											className="w-[100%!important] text-center"
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</section>
		</>
	);
}
