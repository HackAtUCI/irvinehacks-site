/* eslint-disable @next/next/no-img-element */
import Image from "next/image";

import { getPartners } from "./getPartners";
import { client } from "@/lib/sanity/client";
import imageUrlBuilder from "@sanity/image-url";

import SmallStar from "@/assets/icons/small_star.svg";

const builder = imageUrlBuilder(client);

export default async function Partners() {
	const { partners } = await getPartners();

	return (
		<section className="container py-24 relative mx-auto w-full ">
			<Image
				src={SmallStar}
				alt=""
				className="absolute left-16 top-32 hidden lg:block"
				width={42}
				height={42}
			/>
			<Image
				src={SmallStar}
				alt=""
				className="absolute left-32 top-48 hidden xl:block"
				width={42}
				height={42}
			/>
			<Image
				src={SmallStar}
				alt=""
				className="absolute left-20 top-72 hidden lg:block"
				width={30}
				height={30}
			/>
			<Image
				src={SmallStar}
				alt=""
				className="absolute right-32 bottom-24 hidden lg:block"
				width={42}
				height={42}
			/>
			<Image
				src={SmallStar}
				alt=""
				className="absolute right-24 bottom-48 hidden lg:block"
				width={42}
				height={42}
			/>

			<h2 className={`text-center text-4xl sm:text-[3rem] font-display mb-16`}>
				Partners
			</h2>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:max-w-3xl xl:max-w-4xl max-w-xl mx-auto">
				{partners.map(({ _key, name, url, logo }) => (
					<a
						key={_key}
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="bg-white/5 backdrop-blur-sm p-6 aspect-video flex items-center justify-center hover:bg-white/10 transition-colors"
					>
						<img
							src={builder.image(logo).format("webp").url()}
							alt={`${name} logo`}
							className="h-full max-w-full max-h-full object-contain"
						/>
					</a>
				))}
			</div>
		</section>
	);
}
