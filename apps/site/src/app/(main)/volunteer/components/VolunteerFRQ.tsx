import Textfield from "@/lib/components/forms/Textfield";

export default function VolunteerFRQ() {
	return (
		<div className="flex flex-col items-start w-11/12 gap-5">
			<div className="text-4xl font-bold">Volunteer Information</div>
			<Textfield
				name="frq_volunteer"
				labelText="Why are you interested in volunteering, and what do you expect to gain from this experience?"
				containerClass="w-full"
				isRequired={true}
				maxLength={1500}
			/>
			<Textfield
				name="frq_memory"
				labelText="If memories could be edited like a video, which memory would you never want to change and why?"
				containerClass="w-full"
				isRequired={true}
				maxLength={1500}
			/>
		</div>
	);
}
