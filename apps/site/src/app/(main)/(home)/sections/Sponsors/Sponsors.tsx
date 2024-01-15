/* eslint-disable @next/next/no-img-element */
import Image from "next/image";

import { getSponsors } from "./getSponsors";
import fishingBoat from "@/assets/images/fishing-boat.png";
import SponsorTier from "./components/SponsorTier/SponsorTier";

import styles from "./Sponsors.module.scss";

const TIERS = [
	"platinum",
	"gold",
	"silver",
	"bronze",
	"sponsored-prize",
	"in-kind",
];

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
				Interested in sponsoring IrvineHacks 2024? Check out our information
				above to learn more about our event! For more information, please email
				us at{" "}
				<a href="mailto:hack@uci.edu" className="hover:underline font-bold">
					hack@uci.edu
				</a>
				.
			</p>
			{TIERS.map((tier) => (
				<div key={tier}>
					<SponsorTier sponsors={sponsors.get(tier)} className={styles[tier]} />
				</div>
			))}
			<Image src={fishingBoat} alt="boat" width="400" height="400" />
		</section>
	);
}
