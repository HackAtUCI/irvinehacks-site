import Textfield from "@/lib/components/forms/Textfield";
import TextInput from "@/lib/components/forms/TextInput";

// The length here is different from the length specified in API data models.
// This was originally done because different browsers used to count newline characters slightly differently
// Currently unsure if this is still the case
const FRQ_MAX_LENGTH = 2000;

export default function ProfileInformation() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">
				Profile Information
			</p>
			<div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
				<TextInput
					name="linkedin"
					labelText="LinkedIn"
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={false}
					type="url"
					placeholder="https://"
				/>
				<TextInput
					name="portfolio"
					labelText="Portfolio (Github, website, etc.)"
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={false}
					type="url"
					placeholder="https://"
				/>
			</div>
			<Textfield
				name="frq_change"
				labelText="Give an example of a time when you experienced a lot of change. What did you learn from it, and how would you apply what you learned to future experiences? (150+ words recommended)"
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={FRQ_MAX_LENGTH}
			/>

			<Textfield
				name="frq_video_game"
				labelText="If you could design your own video game world, what would it look like, and what features would you add to make it unique?  (100+ words recommended)"
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={FRQ_MAX_LENGTH}
			/>
		</div>
	);
}
