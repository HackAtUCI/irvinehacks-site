import Button from "@/lib/components/Button/Button";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getResources } from "./getResources";
import resource_header_bg from "../../../assets/backgrounds/resources-header-background.png";

import Image from "next/image";

export const revalidate = 60;

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
			<section className="h-full w-full mb-12">
				<div className="relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
					<Image
						src={resource_header_bg}
						alt="Resources Header Background"
						fill
						className="object-cover object-top z-0"
						priority
					/>

					<h1 className="absolute bottom-[5%] text-white text-3xl md:text-4xl lg:text-5xl font-bold z-10">
						Resources
					</h1>
				</div>
				<div className="mb-40 mx-4 ">
					{resources.order.map(
						({ _id, iconUrl, title, description, resources }, i) => (
							<div
								key={_id}
								className="max-w-5xl w-full mx-auto mb-12 bg-[var(--color-white)] text-[#2F1C00] p-12 rounded-2xl lg:grid lg:gap-20 lg:grid-cols-2 lg:items-center"
							>
								<div>
									<div className="flex gap-2 lg:flex-col">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img className="w-8 h-auto lg:w-16" src={iconUrl} alt="" />
										<h2 className="text-2xl font-bold">{title}</h2>
									</div>
									<p>{description}</p>
								</div>
								<div className="flex flex-col gap-3 lg:gap-4">
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
						),
					)}
				</div>
			</section>
		</>
	);
}
