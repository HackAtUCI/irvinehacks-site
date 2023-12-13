import styles from "./Form.module.scss";
import DropdownSelect from "../Components/DropdownSelect";
import TextInput from "../Components/TextInput";
import SimpleRadio from "../Components/SimpleRadio";

//these values can be edited if backend needs it later on

const educationLevels = [
	{ value: "first-year-undergrad", text: "First Year Undergraduate" },
	{ value: "second-year-undergrad", text: "Second Year Undergraduate" },
	{ value: "third-year-undergrad", text: "Third Year Undergraduate" },
	{ value: "fourth-year-undergrad", text: "Fourth Year Undergraduate" },
	{ value: "fifth-year-undergrad", text: "Fifth+ Year Undergraduate" },
	{ value: "graduate", text: "Graduate" },
];
const universityOptions = [
	{ value: "UC Irvine", text: "UC Irvine" },
	{ value: "UC San Diego", text: "UC San Diego" },
	{ value: "UCLA", text: "UCLA" },
	{ value: "UC Berkeley", text: "UC Berkeley" },
	{ value: "Cal State Long Beach", text: "Cal State Long Beach" },
	{ value: "Cal State Fullerton", text: "Cal State Fullerton" },
	{ value: "Cal Poly Pomona", text: "Cal Poly Pomona" },
	{ value: "UC Riverside", text: "UC Riverside" },
	{ value: "UC Santa Barbara", text: "UC Santa Barbara" },
	{ value: "other", text: "Other" },
];

const yesNoOptions = [
	{
		id: "hack-yes",
		labelText: "Yes",
		inputValue: "Yes",
	},
	{
		id: "hack-no",
		labelText: "No",
		inputValue: "No",
	},
];

export default function SchoolInformation() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<p className="text-4xl m-0 font-bold text-center max-[700px]:text-3xl">
				Education
			</p>

			<div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
				<DropdownSelect
					labelStyle={`${styles.label}`}
					inputStyle={`${styles.input}`}
					name="education-level"
					labelText="Current Education Level"
					values={educationLevels}
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
				/>

				<DropdownSelect
					labelStyle={`${styles.label}`}
					inputStyle={`${styles.input}`}
					name="school-name"
					labelText="School Name"
					values={universityOptions}
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
				/>
			</div>

			<TextInput
				name="major"
				labelClass={`${styles.label}`}
				labelText="What is your major?"
				inputClass={`${styles.input}`}
				containerClass="flex flex-col w-full"
				isRequired={true}
				type="text"
				placeholder=""
			/>

			<SimpleRadio
				name="hack-check"
				values={yesNoOptions}
				title="Is this your first Hackathon?"
				titleClass="text-lg mb-0 p-0"
				containerClassTotal="flex flex-row items-center gap-5 max-[600px]:flex-col max-[600px]:items-center max-[600px]:gap-1 max-[600px]:w-full text-center"
				isRequired={true}
				labelClass="font-bold"
				containerClassInputLabels="flex gap-2 items-center"
				containerClassValues="flex gap-3"
			/>
		</div>
	);
}
