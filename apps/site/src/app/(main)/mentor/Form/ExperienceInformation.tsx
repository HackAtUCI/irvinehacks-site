import MultipleSelect from "@/lib/components/forms/MultipleSelect";
import Slider from "@/lib/components/forms/Slider";

const selectOptions = [
	{ value: "frontend", text: "Frontend Web Development" },
	{ value: "backend", text: "Backend Web Development" },
	{ value: "mobile", text: "Mobile App Development" },
	{ value: "databases", text: "Databases" },
	{ value: "ai/ml", text: "AI / Machine Learning" },
	{ value: "vr", text: "Virtual Reality" },
	{ value: "blockchain", text: "Blockchain" },
	{ value: "embedded", text: "Embedded Systems / Hardware" },
	{ value: "data_science", text: "Data Science" },
	{ value: "cybersecurity", text: "Cybersecurity" },
	{ value: "other", text: "Other:" },
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
				name="experienced_technologies"
				labelText="What types of projects would you be comfortable mentoring?"
				containerClass="w-full"
				values={selectOptions}
			/>
		</div>
	);
}
