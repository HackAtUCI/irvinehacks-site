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
		<div className="flex flex-row flex-wrap my-20 gap-16 items-center justify-center">
			{sponsors?.map(({ _key, name, url, logo }) => (
				<a key={_key} href={url} target="_blank" rel="noopener noreferrer">
					{/* eslint-disable-next-line @next/next/no-img-element*/}
					<img
						src={builder.image(logo).format("webp").url()}
						alt={name + " logo"}
						className={"max-w-full max-h-full m-auto my-2 " + className}
					/>
				</a>
			))}
		</div>
	);
}
