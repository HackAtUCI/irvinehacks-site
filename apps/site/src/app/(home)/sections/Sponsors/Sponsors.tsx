/* eslint-disable @next/next/no-img-element */
import Image from "next/image";

import { getSponsors } from "./getSponsors";
import { client } from "@/lib/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import fishingBoat from "@/assets/images/fishing-boat.png";

const builder = imageUrlBuilder(client);

export default async function Sponsors() {
	const sponsors = await getSponsors();

	return (
		<section className="container py-24 relative items-center flex flex-col md:p-8 w-3/4 mx-auto text-center">
			<h2 className="font-display mb-6 text-3xl md:text-4xl">Sponsors</h2>
			<p className="max-w-md mb-6 md:mb-10">
				Interested in sponsoring IrvineHacks 2023? Check out our
				information above to learn more about our event! For more
				information, please email us at hack@uci.edu.
			</p>
			<div className="grid grid-cols-2 gap-8 items-center mb-40">
				{sponsors.sponsors.map(({ _key, name, url, logo }) => (
					<a
						key={_key}
						href={url}
						target="_blank"
						rel="noopener noreferrer"
					>
						<img
							className="w-full"
							src={builder.image(logo).format("webp").url()}
							alt={name + " logo"}
						/>
					</a>
				))}
			</div>
			<Image src={fishingBoat} alt="boat" width="400" height="400" />
		</section>
	);
}
