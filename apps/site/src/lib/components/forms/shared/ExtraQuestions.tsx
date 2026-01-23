import Textfield from "@/lib/components/forms/Textfield";
import SimpleRadio from "@/lib/components/forms/SimpleRadio";
import MultipleSelect from "@/lib/components/forms/MultipleSelect";
import TextInput from "../TextInput";

const sizes = [
	{ labelText: "S", inputValue: "S" },
	{ labelText: "M", inputValue: "M" },
	{ labelText: "L", inputValue: "L" },
	{ labelText: "XL", inputValue: "XL" },
];

const dietary_restrictions = [
	{
		value: "anything",
		text: "I can eat anything, including the following: chicken, beef, pork",
	},
	{ value: "vegetarian", text: "Vegetarian" },
	{ value: "vegan", text: "Vegan" },
	{ value: "no_beef", text: "No Beef" },
	{ value: "no_pork", text: "No Pork" },
	{ value: "gluten_free", text: "Gluten-free" },
	{ value: "other", text: "Other:" },
];

const ihReferences = [
	{ value: "aif", text: "Anteater Involvement Fair (AIF)" },
	{ value: "discord", text: "Discord" },
	{ value: "instagram", text: "Instagram" },
	{ value: "classes", text: "Classes (Ed, Canvas, Announcements, etc.)" },
	{ value: "word_of_mouth", text: "Word of Mouth" },
	{ value: "other", text: "Other:" },
];

export default function ExtraQuestions({ hidden }: { hidden?: boolean }) {
	return (
		<div className={`${hidden && "hidden"} flex flex-col gap-14 w-11/12`}>
			<SimpleRadio
				name="t_shirt_size"
				values={sizes}
				title="T-Shirt Size"
				titleClass="text-xl mb-0.5"
				subtitle={
					<a
						href="https://drive.google.com/file/d/1Pzz5KYmFGCSGXuVOg2E9znkYVfun0X4w/view?usp=sharing"
						className="underline text-[#0084ff]"
						target="_blank"
						rel="noopener noreferrer"
					>
						Size guide
					</a>
				}
				containerClassTotal="w-11/12 flex flex-col gap-5"
				isRequired={true}
				labelClass="text-xl"
				containerClassInputLabels="flex gap-2 items-center"
				containerClassValues="flex gap-5"
			/>
			<MultipleSelect
				name="dietary_restrictions"
				labelText="Dietary restrictions?"
				containerClass="flex flex-col gap-2"
				inputType="checkbox"
				values={dietary_restrictions}
				isRequired
			/>
			<TextInput
				name="allergies"
				labelText="Allergies? (Please specify.)"
				containerClass="w-11/12 flex flex-col gap-5"
				type="text"
				placeholder="Peanuts, shellfish, etc."
				isRequired={false}
			/>
			<MultipleSelect
				name="ih_reference"
				labelText="Where did you hear about IrvineHacks? (select all that apply)"
				containerClass="flex flex-col w-11/12"
				inputType="checkbox"
				values={ihReferences}
				isRequired={true}
			/>
			{/* <Textfield
				name="extra_questions"
				labelText="Any questions, comments, or concerns?"
				containerClass="w-11/12 flex flex-col gap-5"
				isRequired={false}
				maxLength={1500}
			/> */}
		</div>
	);
}
