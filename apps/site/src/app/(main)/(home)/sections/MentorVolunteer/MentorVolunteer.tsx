import CharacterBox from "./CharacterBox";
import { ChatBoxType } from "./CharacterBox";

import hackerSprite from "./hacker_sprite.png";
import mentorSprite from "./mentor_sprite.png";
import volunteerSprite from "./volunteer_sprite.png";

const MentorVolunteer = () => {
	return (
		<section className="flex flex-col justify-center my-14">
			<h2 className="font-display text-5xl text-center mb-12">
				Choose your Character
			</h2>
			<div className="flex flex-col lg:flex-row items-center justify-center gap-x-4 mx-auto">
				<CharacterBox
					className="order-2 lg:order-1"
					imageSrc={mentorSprite}
					chatText="Inspire the next generation of developers and help Hackers on their Journey!"
					titleText="Mentor"
					chatBoxType={ChatBoxType.LEFT}
				/>
				<CharacterBox
					className="order-1 lg:order-2"
					imageSrc={hackerSprite}
					chatText="Face the challenge along with other party members to hone your skills"
					titleText="Hacker"
					chatBoxType={ChatBoxType.CENTER}
				/>
				<CharacterBox
					className="order-3"
					imageSrc={volunteerSprite}
					chatText="Get a peek behind the scenes with free food and swag"
					titleText="Volunteer"
					chatBoxType={ChatBoxType.RIGHT}
				/>
			</div>
		</section>
	);
};

export default MentorVolunteer;
