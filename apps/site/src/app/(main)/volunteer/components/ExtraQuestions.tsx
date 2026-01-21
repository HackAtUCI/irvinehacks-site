import Textfield from "@/lib/components/forms/Textfield";
import SimpleRadio from "@/lib/components/forms/SimpleRadio";
import MultipleSelect from "@/lib/components/forms/MultipleSelect";

const sizes = [
	{ labelText: "S", inputValue: "S" },
	{ labelText: "M", inputValue: "M" },
	{ labelText: "L", inputValue: "L" },
	{ labelText: "XL", inputValue: "XL" },
];

const dietary_restrictions = [
	{ value: "vegetarian", text: "Vegetarian" },
	{ value: "vegan", text: "Vegan" },
	{ value: "no_beef", text: "No Beef" },
	{ value: "no_pork", text: "No Pork" },
	{ value: "gluten_free", text: "Gluten-free" },
	{ value: "other", text: "Other:" },
]

export default function ExtraQuestions() {
	return (
		<>
			<SimpleRadio
				name="t_shirt_size"
				values={sizes}
				title="T-Shirt Size"
				titleClass="text-xl mb-0.5"
				containerClassTotal="w-11/12 flex flex-col gap-5"
				isRequired={true}
				labelClass="text-xl"
				containerClassInputLabels="flex gap-2 items-center"
				containerClassValues="flex gap-5"
			/>
			<MultipleSelect
				name="dietary_restrictions"
				labelText="Dietary restrictions?"
				containerClass="w-11/12 flex flex-col gap-2"
				inputType="checkbox"
				values={dietary_restrictions}
			/>
			<Textfield
				name="allergies"
				labelText="Allergies? (Please specify.)"
				containerClass="w-11/12 flex flex-col gap-5"
				isRequired={false}
				maxLength={1500}
			/>
			{/* <Textfield
				name="extra_questions"
				labelText="Any questions, comments, or concerns?"
				containerClass="w-11/12 flex flex-col gap-5"
				isRequired={false}
				maxLength={1500}
			/> */}
		</>
	);
}
