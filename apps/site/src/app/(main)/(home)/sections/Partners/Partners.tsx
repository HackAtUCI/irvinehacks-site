/* eslint-disable @next/next/no-img-element */
import { getPartners } from "./getPartners";
import { client } from "@/lib/sanity/client";
import imageUrlBuilder from "@sanity/image-url";

import NeonSectionFrame from "@/assets/images/neon-section-frame.svg";

const builder = imageUrlBuilder(client);

export default async function Partners() {
	const { partners } = await getPartners();

	return (
		<section className="container py-24 relative mx-auto w-full ">
			<h2 className="text-center text-4xl sm:text-[3rem] font-display mb-14 text-pink">
				Partners
			</h2>

			<div
				className="relative mx-auto mt-10 w-full max-w-xl lg:max-w-4xl xl:max-w-5xl bg-center bg-no-repeat"
				style={{
					backgroundImage: `url(${NeonSectionFrame.src})`,
					backgroundSize: "100% 100%",
				}}
			>
				<div
					className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 overflow-hidden"
					style={{
						paddingLeft: "clamp(2.25rem, 8vw, 4rem)",
						paddingRight: "clamp(2.25rem, 8vw, 4rem)",
						paddingTop: "clamp(4.25rem, 14vw, 5.5rem)",
						paddingBottom: "clamp(3.75rem, 10vw, 5rem)",
					}}
				>
					{partners.map(({ _key, name, url, logo }) => (
						<a
							key={_key}
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="p-4 sm:p-6 flex items-center justify-center transition-transform hover:scale-[1.02] overflow-hidden h-24 sm:h-28 md:h-32 lg:h-auto lg:aspect-video"
						>
							<img
								src={builder.image(logo).format("webp").url()}
								alt={`${name} logo`}
								className="max-w-full max-h-full object-contain"
							/>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}
