import MultipleSelect from "@/lib/components/forms/MultipleSelect";
import Textfield from "@/lib/components/forms/Textfield";
import TextInput from "@/lib/components/forms/TextInput";

// The length here is different from the length specified in API data models.
// This was originally done because different browsers used to count newline characters slightly differently
// Currently unsure if this is still the case
const FRQ_MAX_LENGTH = 2000;

const areasInterestedOptions = [
	{ value: "software", text: "Software" },
	{ value: "ai", text: "AI/Data" },
	{ value: "hardware", text: "Hardware/Embedded" },
	{ value: "infrastructure", text: "Infrastructure" },
	{ value: "industry", text: "Industry – Finance, Health, Education" },
];

export default function ProfileInformation() {
	return (
		<div className="flex flex-col gap-10 w-11/12">
			<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">
				Profile Information
			</p>
			<div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
				<TextInput
					name="portfolio"
					labelText="Github/Portfolio link"
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={false}
					type="url"
					placeholder="https://"
				/>
				<TextInput
					name="linkedin"
					labelText="LinkedIn"
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={false}
					type="url"
					placeholder="https://"
				/>
			</div>
			<MultipleSelect
				name="areas_interested"
				labelText="Which of the following areas of tech interest you the most for building a project in this upcoming hackathon?"
				containerClass="w-full"
				inputType="checkbox"
				values={areasInterestedOptions}
				isRequired={true}
			/>

			<Textfield
				name="frq_change"
				labelText="Describe a past or current project that you are proud of. [100 words]"
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={FRQ_MAX_LENGTH}
			/>

			<Textfield
				name="frq_ambition"
				labelText="What is something you feel like going above and beyond for? Why? [100 words]"
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={FRQ_MAX_LENGTH}
			/>

			<Textfield
				name="frq_character"
				labelText="“Build your cyberpunk character! Choose your augmentations, accessories, and companion, then explain how each choice reflects your character’s identity, role, or backstory.” [75 words]"
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={FRQ_MAX_LENGTH}
			/>
		</div>
	);
}
