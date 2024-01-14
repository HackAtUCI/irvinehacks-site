/* eslint-disable @next/next/no-img-element */
import Image from "next/image";

import { getSponsors } from "./getSponsors";
import fishingBoat from "@/assets/images/fishing-boat.png";
import SponsorTier from "./components/SponsorTier/SponsorTier";

import styles from "./Sponsors.module.scss";

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
			<SponsorTier
				sponsors={sponsors.get("platinum")}
				className={styles.platinum}
			/>
			<SponsorTier sponsors={sponsors.get("gold")} className={styles.gold} />
			<SponsorTier
				sponsors={sponsors.get("silver")}
				className={styles.silver}
			/>
			<SponsorTier
				sponsors={sponsors.get("bronze")}
				className={styles.bronze}
			/>
			<SponsorTier
				sponsors={sponsors.get("sponsored-prize")}
				className={styles["sponsored-prize"]}
			/>
			<SponsorTier
				sponsors={sponsors.get("in-kind")}
				className={styles["in-kind"]}
			/>
			<Image src={fishingBoat} alt="boat" width="400" height="400" />
		</section>
	);
}
