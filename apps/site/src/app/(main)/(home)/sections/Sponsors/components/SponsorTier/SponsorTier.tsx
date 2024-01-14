import { z } from "zod";
import imageUrlBuilder from "@sanity/image-url";
import { client } from "@/lib/sanity/client";
import { Sponsor } from "../../getSponsors";

const builder = imageUrlBuilder(client);

interface SponsorTierProps {
	sponsors?: z.infer<typeof Sponsor>[];
}

export default function SponsorTier({ sponsors }: SponsorTierProps) {
	return (
		<div className="lg:flex m-10 lg:gap-10 items-center">
			{sponsors?.map(({ _key, name, url, logo }) => (
				<a key={_key} href={url} target="_blank" rel="noopener noreferrer">
					<img
						src={builder.image(logo).format("webp").url()}
						alt={name + " logo"}
						className="max-w-full max-h-full lg:max-w-[300px] lg:max-h-[300px] m-auto my-5"
					/>
				</a>
			))}
		</div>
	);
}
