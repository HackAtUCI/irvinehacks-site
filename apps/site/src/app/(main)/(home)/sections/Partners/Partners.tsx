/* eslint-disable @next/next/no-img-element */
import Image from "next/image";

import { getPartners } from "./getPartners";
import { client } from "@/lib/sanity/client";
import imageUrlBuilder from "@sanity/image-url";

import NeonSectionFrame from "@/assets/images/neon-section-frame.svg";

const builder = imageUrlBuilder(client);

export default async function Partners() {
	const { partners } = await getPartners();

	return (
		<section className="container py-24 relative mx-auto w-full ">
			<h2
				className={`text-center text-4xl sm:text-[3rem] font-display mb-14 text-pink`}
			>
				Partners
			</h2>

			<div className="relative mx-auto w-full flex items-center justify-center mt-10">
				<Image
					src={NeonSectionFrame}
					alt=""
					className="absolute inset-0 w-full h-full object-contain pointer-events-none"
					style={{ transform: "scale(1.4)" }}
				/>
				<div className="relative grid grid-cols-1 lg:grid-cols-4 gap-8 lg:max-w-4xl xl:max-w-5xl max-w-xl mx-auto p-12 lg:p-16 overflow-hidden">
					{partners.map(({ _key, name, url, logo }) => (
						<a
							key={_key}
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="bg-white/5 backdrop-blur-sm p-6 aspect-video flex items-center justify-center hover:bg-white/10 transition-colors overflow-hidden"
						>
							<img
								src={builder.image(logo).format("webp").url()}
								alt={`${name} logo`}
								className="h-full max-w-full max-h-full object-contain"
							/>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}
