import RadioSelect from "@/app/apply/sections/Components/RadioSelect";
import TextInput from "@/app/apply/sections/Components/TextInput";
import styles from "./Form.module.scss";

const pronouns = [
	{ value: "he", text: "He/him/his" },
	{ value: "she", text: "She/her/hers" },
	{ value: "they", text: "They/them/theirs" },
	{ value: "ze", text: "Ze/zir/zirs" },
	{ value: "other", text: "Other:" },
];

const ethnicity = [
	{ value: "American", text: "American Indian or Alaskan" },
	{ value: "Asian", text: "Asian or Pacific Islander" },
	{ value: "Black", text: "Black or African American" },
	{ value: "Hispanic", text: "Hispanic" },
	{ value: "White", text: "White or Caucasian" },
	{ value: "Two-or-more", text: "Two or more races" },
	{ value: "Prefer not to answer", text: "Prefer not to answer" },
	{ value: "other", text: "Other:" },
];

export default function BasicInformation() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<p className="text-4xl m-0 font-bold text-center max-[700px]:text-3xl">
				Basic Information
			</p>

			<div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
				<TextInput
					name="first_name"
					labelClass={styles.label}
					labelText="First Name"
					inputClass={styles.input}
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={true}
					type="text"
					placeholder=""
				/>
				<TextInput
					name="last_name"
					labelClass={styles.label}
					labelText="Last Name"
					inputClass={styles.input}
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={true}
					type="text"
					placeholder=""
				/>
			</div>

			<div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
				<RadioSelect
					IdentifierId="pronouns_identifier"
					name="pronouns"
					labelText="Pronouns"
					values={pronouns}
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
				/>
				<RadioSelect
					IdentifierId="ethnicity_identifier"
					name="ethnicity"
					labelText="Race / Ethnicity"
					values={ethnicity}
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
				/>
			</div>
		</div>
	);
}
