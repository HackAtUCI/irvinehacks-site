import CharacterBox from "./CharacterBox";
import ApplicationHeader from "./ApplicationHeader";

import hackerSprite from "@/assets/images/hacker-sprite.svg";
import mentorSprite from "@/assets/images/mentor-sprite.svg";
import volunteerSprite from "@/assets/images/volunteer-sprite.svg";

import styles from "./ChooseCharacter.module.scss";

const ChooseCharacter = () => {
	return (
		<section className="bg-[#00001c] py-14" id="apply">
			<ApplicationHeader />

			<div className="w-fit mx-auto flex flex-col justify-center">
				<div className={styles.applicationNoticeContainer}>
					<div className={styles.applicationBadge}>
						<p className={styles.applicationText}>APPLICATION NEEDED</p>
					</div>
				</div>

				<div className={styles.applicationNoticeContainer}>
					<p className={styles.applicationDescription}>
						APPLY TO BE A HACKER, MENTOR, OR VOLUNTEER
					</p>
				</div>

				{/* Character boxes */}
				<div className="flex flex-col lg:flex-row items-center justify-center gap-x-4">
					<CharacterBox
						className="order-2 lg:order-1"
						chatText="A creative problem-solver who builds innovative projects that bring ideas to life."
						titleText="Mentor"
						clipClass={styles.glasses}
						imageSrc={mentorSprite}
						textAlign="text-left"
						href="/mentor"
					/>
					<CharacterBox
						className="order-1 lg:order-2"
						chatText="An experienced guide who supports teams with feedback, advice, and technical expertises."
						titleText="Hacker"
						clipClass={styles.sword}
						imageSrc={hackerSprite}
						textAlign="text-center"
						href="/apply"
					/>
					<CharacterBox
						className="order-3"
						chatText="A dedicated helper who keeps the event organized and running smoothly for everyone."
						titleText="Volunteer"
						clipClass={styles.orb}
						imageSrc={volunteerSprite}
						textAlign="text-right"
						href="/volunteer"
					/>
				</div>
			</div>
		</section>
	);
};

export default ChooseCharacter;