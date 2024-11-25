/* eslint-disable @next/next/no-img-element */
import Image from "next/image";

import fishingBoat from "@/assets/images/fishing-boat.png";
import partners from "@/data/partners.json";

import { client } from "@/lib/sanity/client";
import imageUrlBuilder from "@sanity/image-url";

import styles from "./Partners.module.scss";

const builder = imageUrlBuilder(client);

export default function Sponsors() {
	return (
		<section className="container py-24 md:my-16 relative items-center flex flex-col md:p-8 w-3/4 mx-auto text-center">
			<h2
				className={`${styles.title} my-12 font-display sm:text-[3rem] text-[#fffce2] text-4xl text-center`}
			>
				Partners
			</h2>
			<div className="flex flex-wrap gap-8 justify-center pb-32 items-center">
				{partners.partners.map(({ _key, name, url, logo }) => (
					<a
						key={_key}
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="max-w-xs flex-grow"
					>
						{/* eslint-disable-next-line @next/next/no-img-element*/}
						<img
							src={builder.image(logo).format("webp").url()}
							alt={name + " logo"}
							className={"max-w-full max-h-full m-auto my-2"}
						/>
					</a>
				))}
			</div>
			<Image src={fishingBoat} alt="boat" width="400" height="400" />
		</section>
	);
}
