"use client";

import RadioSelect from "@/lib/components/forms/RadioSelect";
import Textfield from "@/lib/components/forms/Textfield";

export default function VolunteerFRQ() {
	return (
		<div className="flex flex-col items-start w-11/12 gap-5">
			<div className="text-4xl font-bold">Volunteer Information</div>
			<RadioSelect
				name="applied_before"
				labelText="Did you apply to be a hacker for IrvineHacks 2025?"
				values={[
					{ value: "Yes", text: "Yes" },
					{ value: "No", text: "No" },
				]}
				IdentifierId="hackerQ"
				containerClass=""
				horizontal={true}
			/>
			<Textfield
				name="volunteer_q1"
				labelText="Why are you interested in volunteering, and what do you expect to gain from this experience?"
				labelClass="text-xl pb-2"
				containerClass="w-full"
				inputClass="w-full rounded-xl min-h-[200px] max-h-[500px] text-black p-3"
				isRequired={true}
				maxLength={1500}
			/>
			<Textfield
				name="volunteer_q2"
				labelText="If you were a kitchen utensil, what would you be and why?"
				labelClass="text-xl pb-2"
				containerClass="w-full"
				inputClass="w-full rounded-xl min-h-[200px] max-h-[500px] text-black p-3"
				isRequired={true}
				maxLength={1500}
			/>
		</div>
	);
}
