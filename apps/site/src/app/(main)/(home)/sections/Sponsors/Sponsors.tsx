import { getSponsors } from "./getSponsors";
import SponsorTier from "./components/SponsorTier/SponsorTier";
import styles from "./Sponsors.module.scss";

import NeonSectionFrame from "@/assets/images/neon-section-frame.svg";

// no sponsors under bronze for IH 2025
const TIERS = [
	"platinum",
	"gold",
	"silver",
	// "bronze",
	// "sponsored-prize",
	// "in-kind",
];

const Sponsors = async () => {
	const sponsors = await getSponsors();

	return (
		<section className="container py-24 relative mx-auto w-full">
			<h2 className="text-center text-4xl sm:text-[3rem] font-display mb-14 text-pink">
				Sponsors
			</h2>

			<div className={styles.sponsorsContainer}>
				<div className="absolute w-full left-0 top-[1rem] flex gap-4 px-8 ">
					<div className="h-[2px] bg-white flex-grow  ml-[2rem] mt-[0.5rem]" />
					<p className="text-xs lg:text-sm text-center">
						Interested in sponsoring IrvineHacks 2026? Email us at{" "}
						<a href="mailto:hack@uci.edu" className="underline">
							hack@uci.edu
						</a>
						.
					</p>
					<div className="h-[2px] bg-white flex-grow mr-[2rem] mt-[0.5rem]" />
				</div>
			</div>

			<div
				className={styles.sponsorsContainer}
				style={{
					backgroundImage: `url(${NeonSectionFrame.src})`,
					backgroundSize: "100% 100%",
				}}
			>
				<div
					style={{
						paddingLeft: "clamp(2.25rem, 8vw, 4rem)",
						paddingRight: "clamp(2.25rem, 8vw, 4rem)",
						paddingTop: "clamp(4.25rem, 14vw, 5.5rem)",
						paddingBottom: "clamp(3.75rem, 10vw, 5rem)",
					}}
				>
					{TIERS.map((tier) => (
						<div key={tier}>
							<SponsorTier
								sponsors={sponsors.get(tier)}
								className={styles[tier]}
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Sponsors;
