import Textfield from "@/lib/components/forms/Textfield";

export default function ShortAnswers() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">
				Profile Information
			</p>
			<Textfield
				name="mentor_prev_experience_saq1"
				labelText="Have you participated or mentored at a hackathon before? If so, please list which ones. e.g. IrvineHacks 2024 (Hacker), ZotHacks 2024 (Mentor)"
				containerClass="flex flex-col w-full"
				isRequired={false}
				maxLength={1500}
			/>
			<Textfield
				name="mentor_interest_saq2"
				labelText="Why are you interested in being a mentor for IrvineHacks 2025? (100+ words recommended)"
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={1500}
			/>
			<Textfield
				name="mentor_team_help_saq3"
				labelText="How would you go about helping a team that is struggling with a bug?"
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={1500}
			/>
			<Textfield
				name="mentor_team_help_saq4"
				labelText="How would you go about helping a team that is struggling to work together?"
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={1500}
			/>
		</div>
	);
}
