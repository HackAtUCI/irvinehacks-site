import CharacterBox from "./CharacterBox";

import hackerSprite from "@/assets/images/hacker_sprite.png";
import mentorSprite from "@/assets/images/mentor_sprite.png";
import volunteerSprite from "@/assets/images/volunteer_sprite.png";
import leftChatBox from "@/assets/images/left_chat_box.svg";
import centerChatBox from "@/assets/images/center_chat_box.svg";
import rightChatBox from "@/assets/images/right_chat_box.svg";
import leftChatBG from "@/assets/images/left_chat_box_bg.svg";
import centerChatBG from "@/assets/images/center_chat_box_bg.svg";
import rightChatBG from "@/assets/images/right_chat_box_bg.svg";

import styles from "./CharacterBox.module.scss";

const ChooseCharacter = () => {
	return (
		<section className="flex flex-col justify-center my-14">
			<h2 className="font-display text-5xl text-center mb-12">
				Choose your Character
			</h2>
			<div className="flex flex-col lg:flex-row items-center justify-center gap-x-4 mx-auto">
				<CharacterBox
					className="order-2 lg:order-1"
					chatText="Inspire the next generation of developers and help Hackers on their Journey!"
					titleText="Mentor"
					clipClass={styles.glasses}
					imageSrc={mentorSprite}
					chatBoxImageSrc={leftChatBox}
					bgImageSrc={leftChatBG}
					textAlign={"text-left"}
					href="/mentor"
				/>
				<CharacterBox
					className="order-1 lg:order-2"
					chatText="Face the challenge along with other party members to hone your skills"
					titleText="Hacker"
					clipClass={styles.sword}
					imageSrc={hackerSprite}
					chatBoxImageSrc={centerChatBox}
					bgImageSrc={centerChatBG}
					textAlign={"text-center"}
					href="/apply"
				/>
				<CharacterBox
					className="order-3"
					chatText="Get a peek behind the scenes with free food and swag"
					titleText="Volunteer"
					clipClass={styles.orb}
					imageSrc={volunteerSprite}
					chatBoxImageSrc={rightChatBox}
					bgImageSrc={rightChatBG}
					textAlign="text-right"
					href="/volunteer"
				/>
			</div>
		</section>
	);
};

export default ChooseCharacter;
