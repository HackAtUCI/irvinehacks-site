import { client } from "@/lib/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { z } from "zod";
import { Sponsor } from "../../getSponsors";

const builder = imageUrlBuilder(client);

interface SponsorTierProps {
	className: string;
	sponsors?: z.infer<typeof Sponsor>[];
}

export default function SponsorTier({ className, sponsors }: SponsorTierProps) {
	return (
		<div className="flex flex-col sm:flex-row flex-wrap mt-8 xl:mb-20 gap-8 xl:gap-16 items-center justify-center">
			{sponsors?.map(({ _key, name, url, logo }) => (
				<a
					key={_key}
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="transition-transform hover:scale-105"
				>
					<div
						className={
							"flex items-center justify-center py-2 px-4 bg-[#c6c6ce] rounded-2xl " +
							className
						}
					>
						{/* eslint-disable-next-line @next/next/no-img-element*/}
						<img
							src={builder.image(logo).format("webp").url()}
							alt={name + " logo"}
							className="max-w-full max-h-full object-contain"
						/>
					</div>
				</a>
			))}
		</div>
	);
}
