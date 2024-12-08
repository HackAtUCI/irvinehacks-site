import Textfield from "@/lib/components/forms/Textfield";

export default function ExtraQuestions() {
	return (
		<>
			<Textfield
				name="allergies"
				labelText="If you are tasked to serve food, do you have any allergies we should be aware of? If so, please explain the severity of each allergy."
				labelClass="text-xl pb-3"
				containerClass="w-11/12 flex flex-col gap-5"
				inputClass="text-black p-3 rounded-xl min-h-[200px] max-h-[500px] text-black"
				isRequired={false}
				maxLength={1500}
			/>
			<Textfield
				name="extra_questions"
				labelText="Any questions, comments, or concerns?"
				labelClass="text-xl pb-3"
				containerClass="w-11/12 flex flex-col gap-5"
				inputClass="text-black p-3 rounded-xl min-h-[200px] max-h-[500px] text-black"
				isRequired={false}
				maxLength={1500}
			/>
		</>
	);
}
