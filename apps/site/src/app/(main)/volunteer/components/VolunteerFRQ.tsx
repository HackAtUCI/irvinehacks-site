import CharacterCustomizer from "@/lib/components/forms/shared/CharacterCustomizer";
import Textfield from "@/lib/components/forms/Textfield";

export default function VolunteerFRQ() {
	return (
		<div className="flex flex-col items-start w-11/12 gap-5">
			<div className="text-4xl font-bold">Volunteer Information</div>
			<Textfield
				name="frq_volunteer"
				labelText="Why are you interested in volunteering, and what do you expect to gain from this experience? (max word count 150)"
				containerClass="w-full"
				isRequired={true}
				maxWordCount={150}
			/>
			<Textfield
				name="frq_memory"
				labelText="If memories could be edited like a video, which memory would you never want to change and why? (max word count 100)"
				containerClass="w-full"
				isRequired={true}
				maxWordCount={100}
			/>
			<p className="text-lg mb-2">
				Our IrvineHacks 2026 theme is cyberpunk! Want to design a cyberpunk
				avatar? Pick their augmentations, accessories, and companion, and just
				have fun creating your character.
			</p>
			<CharacterCustomizer />
		</div>
	);
}
