import MultipleSelect from "@/lib/components/forms/MultipleSelect";
import Textfield from "@/lib/components/forms/Textfield";

export default function VolunteerFRQ() {
	return (
		<div className="flex flex-col items-start w-11/12 gap-5">
			<div className="text-4xl font-bold">Volunteer Information</div>
			<MultipleSelect
				name="applied_before"
				labelText="Did you apply to be a hacker for IrvineHacks 2025?"
				values={[
					{ value: "Yes", text: "Yes" },
					{ value: "No", text: "No" },
				]}
				containerClass=""
				inputType="radio"
				horizontal={true}
				isRequired={true}
			/>
			<Textfield
				name="frq_volunteer"
				labelText="Why are you interested in volunteering, and what do you expect to gain from this experience?"
				containerClass="w-full"
				isRequired={true}
				maxLength={1500}
			/>
			<Textfield
				name="frq_utensil"
				labelText="If you were a kitchen utensil, what would you be and why?"
				containerClass="w-full"
				isRequired={true}
				maxLength={1500}
			/>
		</div>
	);
}
