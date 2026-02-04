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
import ShiftAvailability from "../../volunteer/components/ShiftAvailability";

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
			<div className="w-11/12">
				<p className="text-lg break-words">
					[Note] If you have any questions about IrvineHacks or being a mentor,
					please email <b className="break-all">irvinehacks2026@gmail.com</b>.
				</p>
			</div>

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
			<div className="w-11/12">
				<p className="text-lg">
					[<strong className="text-[#FBA80A]">Tech Mentor</strong>]: Tech
					mentors help hackers with technical challenges during the hackathon.
					This includes debugging code, troubleshooting hardware, advising on
					tools and tech stacks, and helping teams scope their ideas into
					something achievable within the event timeline. <br />
					Tech mentors guide teams through problem-solving without building the
					project for them.
				</p>
			</div>
			<div className="w-11/12">
				<p className="text-lg">
					[<strong className="text-[#FBA80A]">Design Mentor</strong>]: Design
					mentors help hackers with UX, UI, and visual design. This includes
					giving feedback on user flows, wireframes, and prototypes, improving
					usability and accessibility, and helping teams turn ideas into clear,
					intuitive designs that can be completed during the hackathon.
				</p>
			</div>
			<AgeInformation hidden={hidden} />

			<BasicInformation hidden={hidden} />
			<SchoolInformation hidden={hidden} />
			<ShiftAvailability hidden={hidden} />
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

			{/* <Textfield
				name="other_questions"
				labelText="Questions/comments/concerns?"
				containerClass={`${hidden && "hidden"} flex flex-col w-11/12`}
				isRequired={false}
			/> */}
		</BaseForm>
	);
}
