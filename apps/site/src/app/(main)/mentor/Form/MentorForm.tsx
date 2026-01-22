"use client";
import { useState } from "react";

import BaseForm from "@/lib/components/forms/shared/BaseForm";
import AgeInformation from "@/lib/components/forms/shared/AgeInformation";
import SchoolInformation from "@/lib/components/forms/shared/SchoolInformation";
import ResumeInformation from "@/lib/components/forms/shared/ResumeInformation";
import BasicInformation from "./MentorBasicInformation";
import ProfileInformation from "./MentorProfileInformation";
import ShortAnswers from "./MentorShortAnswers";
import ExperienceInformation from "./MentorExperienceInformation";
import MultipleSelect from "@/lib/components/forms/MultipleSelect";
import ControlledMultipleSelect from "@/lib/components/forms/ControlledMultipleSelect";
import ExtraQuestions from "@/lib/components/forms/shared/ExtraQuestions";

export default function MentorForm() {
	const [mentorSelection, setMentorSelection] = useState<
		Record<string, boolean>
	>({
		is_tech_mentor: false,
		is_design_mentor: false,
	});

	const hidden = !Object.values(mentorSelection).some((value) =>
		Boolean(value),
	);

	return (
		<BaseForm applicationType="Mentor" applyPath="/api/user/mentor">
			<ControlledMultipleSelect
				name="mentor_type"
				containerClass="w-11/12"
				labelText="What type of mentor are you applying for? Select at least one option."
				values={[
					{ value: "is_tech_mentor", text: "Tech" },
					{ value: "is_design_mentor", text: "Design" },
				]}
				controlledObject={mentorSelection}
				setControlledObject={setMentorSelection}
				inputType="checkbox"
				isRequired
			/>

			<BasicInformation hidden={hidden} />
			<SchoolInformation hidden={hidden} />
			<ExtraQuestions hidden={hidden} />

			<ExperienceInformation
				isTechMentor={mentorSelection.is_tech_mentor}
				isDesignMentor={mentorSelection.is_design_mentor}
				hidden={hidden}
			/>

			<ResumeInformation isRequired hidden={hidden} />
			<MultipleSelect
				name="resume_share_to_sponsors"
				containerClass="w-11/12"
				labelText="Would you like us to share your resume with our sponsors?"
				values={[
					{ value: "yes", text: "Yes" },
					{ value: "no", text: "No" },
				]}
				inputType="radio"
				hidden={hidden}
			/>

			<ProfileInformation hidden={hidden} />
			<ShortAnswers
				isTechMentor={mentorSelection.is_tech_mentor}
				isDesignMentor={mentorSelection.is_design_mentor}
				hidden={hidden}
			/>

			{/* optional cyberpunk avatar */}
			{/* <Textfield
				name="other_questions"
				labelText="Questions/comments/concerns?"
				containerClass={`${hidden && "hidden"} flex flex-col w-11/12`}
				isRequired={false}
			/> */}
			<AgeInformation hidden={hidden} />
		</BaseForm>
	);
}
