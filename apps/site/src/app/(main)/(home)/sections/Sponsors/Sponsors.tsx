import { getSponsors } from "./getSponsors";
import SponsorTier from "./components/SponsorTier/SponsorTier";
import styles from "./Sponsors.module.scss";

import NeonSectionFrame from "@/assets/images/neon-section-frame.svg";

// Only GlenAir in silver for IH 2026, but they don't want logo shown
const TIERS = [
	"platinum",
	"gold",
	// "silver",
	"bronze",
	// "sponsored-prize",
	// "in-kind",
];

const Sponsors = async () => {
	const sponsors = await getSponsors();

	return (
		<section className="container py-24 relative mx-auto w-full">
			<h2 className="text-center text-4xl sm:text-[3rem] font-display text-pink -mb-4">
				Sponsors
			</h2>

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
					<div className="flex gap-4 items-center justify-center mt-8 mb-8 px-4">
						<div className="h-[2px] bg-white flex-grow max-w-[2rem] self-center" />
						<p className="text-xs lg:text-sm text-center shrink-0 my-0">
							Interested in sponsoring IrvineHacks 2026? Email us at{" "}
							<a href="mailto:hack@uci.edu" className="underline">
								hack@uci.edu
							</a>
							.
						</p>
						<div className="h-[2px] bg-white flex-grow max-w-[2rem] self-center" />
					</div>
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
