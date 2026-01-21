import Textfield from "@/lib/components/forms/Textfield";

interface ShortAnswersProps {
	isTechMentor: boolean;
	isDesignMentor: boolean;
	hidden: boolean;
}

export default function ShortAnswers({
	isTechMentor,
	isDesignMentor,
	hidden,
}: ShortAnswersProps) {
	return (
		<div className={`${hidden && "hidden"} flex flex-col gap-5 w-11/12`}>
			<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">
				Question Prompts
			</p>
			<Textfield
				name="mentor_interest_saq2"
				labelText="Why are you interested in being a mentor for IrvineHacks 2026? (100+ words recommended)"
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={1500}
			/>
			<Textfield
				name="mentor_tech_saq3"
				labelText="How would you go about helping a team that is struggling with a bug?"
				containerClass={`${!isTechMentor && "hidden"} flex flex-col w-full`}
				isRequired={isTechMentor}
				maxLength={1500}
			/>
			<Textfield
				name="mentor_design_saq4"
				labelText="How would you go about helping a team that is struggling with a design problem?"
				containerClass={`${!isDesignMentor && "hidden"} flex flex-col w-full`}
				isRequired={isDesignMentor}
				maxLength={1500}
			/>
			<Textfield
				name="mentor_interest_saq5"
				labelText="How would you help participants turn an ambitious idea into something achievable within the hackathon?"
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={1500}
			/>
		</div>
	);
}
