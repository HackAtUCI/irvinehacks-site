import Image from "next/image";
import Lantern from "@/lib/components/Lantern/Lantern";
import koiJump from "@/assets/images/koi-jump.png";
import styles from "./About.module.css";

const About = () => {
	return (
		<>
			<section className="container md mx-auto text-center my-14 max-w-sm sm:max-w-lg xl:max-w-screen-md relative">
				<Lantern
					width={300}
					height={300}
					className="lg:hidden mx-auto"
				/>
				<Lantern
					width={300}
					height={300}
					className="absolute hidden lg:block"
					style={{ top: "30%", left: "-45%" }}
				/>
				<Lantern
					width={350}
					height={350}
					className="absolute hidden lg:block"
					style={{ top: "75%", right: "-50%" }}
				/>
				<div className="text-2xl lg:text-3xl mb-5">
					<h2>
						<span className={styles.statistic}>36</span> Hours
					</h2>
					<h2>
						<span className={styles.statistic}>400+</span> Hackers
					</h2>
					<h2>
						<span className={styles.statistic}>$5,000+</span> in
						Prizes
					</h2>
				</div>
				<h3 className="text-xl lg:text-2xl mb-5">
					Create + Connect + Inspire
				</h3>
				<p>
					IrvineHacks is the largest collegiate hackathon in Orange
					County and we continue expanding and improving our event
					every year. Our focus? – Enhance the community around us by
					giving students the platform to unleash their creativity in
					an environment of forward thinking individuals.
				</p>
				<p>
					This year, IrvineHacks will take place the weekend of
					January 26th to 28th. The event will be 100% in-person
					during the day (not overnight). Free workshops, socials,
					food, and swag will be provided!
				</p>
			</section>
			<Image
				src={koiJump}
				width="150"
				height="150"
				alt="Koi fish"
				className="mx-auto mb-14"
			/>
		</>
	);
};

export default About;
