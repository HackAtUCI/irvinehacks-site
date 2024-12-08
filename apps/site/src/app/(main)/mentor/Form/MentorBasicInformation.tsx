import MultipleSelect from "@/lib/components/forms/MultipleSelect";
import TextInput from "@/lib/components/forms/TextInput";

const pronouns = [
	{ value: "he", text: "He/him/his" },
	{ value: "she", text: "She/her/hers" },
	{ value: "they", text: "They/them/theirs" },
	{ value: "ze", text: "Ze/zir/zirs" },
	{ value: "other", text: "Other:" },
];

export default function MentorBasicInformation() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<p className="text-4xl m-0 max-[700px]:text-3xl">Basic Information</p>
			<div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
				<TextInput
					name="first_name"
					labelText="First Name"
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={true}
					type="text"
					placeholder="Peter"
				/>
				<TextInput
					name="last_name"
					labelText="Last Name"
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={true}
					type="text"
					placeholder="Anteater"
				/>
			</div>

			<div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
				<MultipleSelect
					name="pronouns"
					labelText="Preferred Pronouns"
					containerClass="flex flex-col w-full"
					inputType="checkbox"
					values={pronouns}
				/>
			</div>
		</div>
	);
}
