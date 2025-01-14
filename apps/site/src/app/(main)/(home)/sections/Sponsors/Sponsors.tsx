// import { getSponsors } from "./getSponsors";
// import SponsorTier from "./components/SponsorTier/SponsorTier";
import styles from "./Sponsors.module.scss";

// const TIERS = [
// 	"platinum",
// 	"gold",
// 	"silver",
// 	"bronze",
// 	"sponsored-prize",
// 	"in-kind",
// ];

const Sponsors = async () => {
	// const sponsors = await getSponsors();

	return (
		<section className="container py-24 md:my-16 relative items-center flex flex-col md:p-8 w-4/5 mx-auto text-center">
			<h2
				className={`my-12 font-display font-bold sm:text-[3rem] text-white text-3xl text-center`}
			>
				Sponsors
			</h2>

			<div className={styles.sponsorsContainer}>
				<div className="absolute w-full left-0 top-[1rem] flex gap-4 px-8 ">
					<div className="h-[2px] bg-white flex-grow  ml-[2rem] mt-[0.5rem]" />
					<p className="text-xs lg:text-sm text-center">
						Interested in sponsoring IrvineHacks 2025? Email us at{" "}
						<a href="mailto:hack@uci.edu" className="underline">
							hack@uci.edu
						</a>
						.
					</p>
					<div className="h-[2px] bg-white flex-grow mr-[2rem] mt-[0.5rem]" />
				</div>

				{/* {TIERS.map((tier) => (
					<div key={tier}>
						<SponsorTier
							sponsors={sponsors.get(tier)}
							className={styles[tier]}
						/>
					</div>
				))} */}

				{/* <div className={`${styles.horizontalLine} ${styles.bottom}`} /> */}
				{/* <div className={styles.cornerSquares}>
					<div className={styles.topLeft} />
					<div className={styles.topRight} />
					<div className={styles.bottomLeft} />
					<div className={styles.bottomRight} />
				</div> */}
			</div>
		</section>
	);
};

export default Sponsors;
