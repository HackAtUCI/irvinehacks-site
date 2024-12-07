import MultipleSelect from "@/lib/components/forms/MultipleSelect";
import Slider from "@/lib/components/forms/Slider";

const selectOptions = [
	{ name: "frontend", value: "frontend", text: "Frontend Web Development" },
	{ name: "backend", value: "backend", text: "Backend Web Development" },
	{ name: "mobile", value: "mobile", text: "Mobile App Development" },
	{ name: "databases", value: "databases", text: "Databases" },
	{ name: "ai/ml", value: "ai/ml", text: "AI / Machine Learning" },
	{ name: "vr", value: "vr", text: "Virtual Reality" },
	{ name: "blockchain", value: "blockchain", text: "Blockchain" },
	{
		name: "embedded",
		value: "embedded",
		text: "Embedded Systems / Hardware",
	},
	{ name: "data_science", value: "data_science", text: "Data Science" },
	{ name: "cybersecurity", value: "cybersecurity", text: "Cybersecurity" },
	{ name: "other_mentor_experience", value: "other", text: "Other:" },
];

export default function ExperienceInformation() {
	return (
		<div className="flex flex-col gap-20 w-11/12">
			<Slider
				containerClass="w-full"
				labelText="Rate your experience with Git:"
				pretext="No Experience"
				postText="Expert"
				name="git_experience"
			/>
			<MultipleSelect
				labelText="What types of projects would you be comfortable mentoring?"
				identifierId="mentor_comfortable_select"
				containerClass="w-full"
				values={selectOptions}
			/>
		</div>
	);
}
