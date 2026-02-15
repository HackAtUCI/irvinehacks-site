import { getSponsors } from "./getSponsors";
import SponsorTier from "./components/SponsorTier/SponsorTier";

import NeonSectionFrame from "@/assets/images/neon-section-frame.svg";

import styles from "./Sponsors.module.scss";

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
			<h2 className="text-center text-2xl sm:text-4xl lg:text-[3rem] font-display text-pink mb-4 lg:-mb-4">
				Sponsors
			</h2>

			<div
				className={styles.sponsorsContainer}
				style={
					{
						"--bg-image": `url(${NeonSectionFrame.src})`,
					} as React.CSSProperties
				}
			>
				<div
					style={{
						paddingLeft: "clamp(2.25rem, 8vw, 4rem)",
						paddingRight: "clamp(2.25rem, 8vw, 4rem)",
						paddingTop: "clamp(1.25rem, 2rem, 5.5rem)",
					}}
					className="pb-16 lg:pb-64"
				>
					<div className="flex gap-4 items-center justify-center mt-8 lg:mt-64 mb-16 px-10 sm:px-4">
						<div className="h-[2px] bg-white flex-grow max-w-[2rem] self-center" />
						<p className="text-center shrink-0 my-0 max-w-full">
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
