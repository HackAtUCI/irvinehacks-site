/* eslint-disable @next/next/no-img-element */
import Image from "next/image";

import { getSponsors } from "./getSponsors";
import { client } from "@/lib/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import fishingBoat from "@/assets/images/fishing-boat.png";

import styles from "./Sponsors.module.scss";

const builder = imageUrlBuilder(client);

export default async function Sponsors() {
	const sponsors = await getSponsors();

	return (
		<section className="container py-24 md:my-16 relative items-center flex flex-col md:p-8 w-3/4 mx-auto text-center">
			<h2
				className={`${styles.title} my-12 font-display sm:text-[3rem] text-[#fffce2] text-4xl text-center`}
			>
				Sponsors
			</h2>
			<p className="max-w-md mb-12">
				Interested in sponsoring IrvineHacks 2024? Check out our
				information above to learn more about our event! For more
				information, please email us at{" "}
				<a
					href="mailto:hack@uci.edu"
					className="hover:underline font-bold"
				>
					hack@uci.edu
				</a>
				.
			</p>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center mb-12">
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
