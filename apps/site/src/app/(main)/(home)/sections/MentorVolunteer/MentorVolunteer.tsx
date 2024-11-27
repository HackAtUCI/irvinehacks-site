import CharacterBox from "./CharacterBox";
import { ChatBoxType } from "./CharacterBox";

import hackerSprite from "./hacker_sprite.png";
import mentorSprite from "./mentor_sprite.png";
import volunteerSprite from "./volunteer_sprite.png";

const MentorVolunteer = () => {
	return (
		<div className="flex items-center justify-center">
			<CharacterBox
				imageSrc={mentorSprite}
				chatText="Inspire the next generation of developers and help Hackers on their Journey!"
				titleText="Mentor"
				chatBoxType={ChatBoxType.LEFT}
			/>
			<CharacterBox
				imageSrc={hackerSprite}
				chatText="Face the challenge along with other party members to hone your skills"
				titleText="Hacker"
				chatBoxType={ChatBoxType.CENTER}
			/>
			<CharacterBox
				imageSrc={volunteerSprite}
				chatText="Get a peek behind the scenes with free food and swag"
				titleText="Volunteer"
				chatBoxType={ChatBoxType.RIGHT}
			/>
		</div>
	);
};

export default MentorVolunteer;
