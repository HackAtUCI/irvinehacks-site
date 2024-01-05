import styles from "./Form.module.scss";
import DropdownSelect from "@/lib/components/forms/DropdownSelect";
import SimpleRadio from "@/lib/components/forms/SimpleRadio";

//these values can be edited if backend needs it later on

const educationLevels = [
	{ value: "high school", text: "High School (18+)" },
	{ value: "first-year-undergrad", text: "First Year Undergraduate" },
	{ value: "second-year-undergrad", text: "Second Year Undergraduate" },
	{ value: "third-year-undergrad", text: "Third Year Undergraduate" },
	{ value: "fourth-year-undergrad", text: "Fourth Year Undergraduate" },
	{ value: "fifth-year-undergrad", text: "Fifth+ Year Undergraduate" },
	{ value: "graduate", text: "Graduate" },
];
const universityOptions = [
	{ value: "UC Irvine", text: "UC Irvine" },
	{ value: "Cal Poly Pomona", text: "Cal Poly Pomona" },
	{ value: "Cal State Fullerton", text: "Cal State Fullerton" },
	{ value: "Cal State Long Beach", text: "Cal State Long Beach" },
	{ value: "UC Berkeley", text: "UC Berkeley" },
	{ value: "UCLA", text: "UCLA" },
	{ value: "UC Riverside", text: "UC Riverside" },
	{ value: "UC San Diego", text: "UC San Diego" },
	{ value: "UC Santa Barbara", text: "UC Santa Barbara" },
	{ value: "other", text: "Other" },
];

const majorOptions = [
	{
		value: "Business Information Management",
		text: "Business Information Management",
	},
	{ value: "Computer Game Science", text: "Computer Game Science" },
	{ value: "Computer Science", text: "Computer Science" },
	{
		value: "Computer Science and Engineering",
		text: "Computer Science and Engineering",
	},
	{ value: "Data Science", text: "Data Science" },
	{ value: "Informatics", text: "Informatics" },
	{ value: "Electrical Engineering", text: "Electrical Engineering" },
	{ value: "Software Engineering", text: "Software Engineering" },
	{ value: "N/A (High School)", text: "N/A (High School)" },
	{ value: "Undeclared", text: "Undeclared" },
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
					labelStyle={styles.label}
					inputStyle={styles.input}
					name="education_level"
					labelText="Current Education Level"
					values={educationLevels}
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
				/>

				<DropdownSelect
					labelStyle={styles.label}
					inputStyle={styles.input}
					name="school"
					labelText="School Name"
					values={universityOptions}
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
				/>
			</div>

			<div className="flex gap-5 items-end w-full max-[1000px]:flex-col max-[1000px]:items-center">
				<DropdownSelect
					labelStyle={styles.label}
					inputStyle={styles.input}
					name="major"
					labelText="What is your major?"
					values={majorOptions}
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
				/>

				<SimpleRadio
					name="is_first_hackathon"
					values={yesNoOptions}
					title="Is this your first Hackathon?"
					titleClass="text-lg mb-0 p-0"
					containerClassTotal="flex gap-5 w-6/12 max-[1000px]:w-full mb-2 max-[1300px]:mb-0 max-[1300px]:flex-col max-[1300px]:gap-1 items-center text-center"
					isRequired={true}
					labelClass="font-bold"
					containerClassInputLabels="flex gap-2 items-center"
					containerClassValues="flex gap-3"
				/>
			</div>
		</div>
	);
}
