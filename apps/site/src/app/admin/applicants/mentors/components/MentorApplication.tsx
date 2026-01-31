import { PortableText } from "@portabletext/react";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import ColumnLayout from "@cloudscape-design/components/column-layout";

import {
	IrvineHacksMentorApplicationQuestion,
	IrvineHacksMentorApplicationData,
} from "@/lib/admin/useApplicant";
import MentorApplicationSection, {
	TechMentorSection,
	DesignMentorSection,
} from "@/app/admin/applicants/mentors/components/MentorApplicationSection";
import ResponseSection from "../../components/ResponseSection";
import DayShift from "../../components/DayShift";
import { IrvineHacksMentorScoringGuidelinesType } from "./getScoringGuidelines";

interface MentorApplicationSections {
	[key: string]: IrvineHacksMentorApplicationQuestion[];
}

const MENTOR_APPLICATION_SECTIONS: MentorApplicationSections = {
	"Personal Information": ["mentor_type", "pronouns", "is_18_older"],
	Education: ["school", "education_level", "major"],
	Experience: ["linkedin", "resume_url", "resume_share_to_sponsors"],
};

function MentorApplication({
	application_data,
	guidelines,
}: {
	application_data: IrvineHacksMentorApplicationData;
	guidelines?: IrvineHacksMentorScoringGuidelinesType;
}) {
	return (
		<SpaceBetween direction="vertical" size="m">
			<Container header={<Header variant="h2">Mentor Application</Header>}>
				<SpaceBetween direction="vertical" size="m">
					{Object.entries(MENTOR_APPLICATION_SECTIONS).map(
						([section, questions]) => (
							<MentorApplicationSection
								key={section}
								title={section}
								data={application_data}
								propsToShow={questions}
							/>
						),
					)}
				</SpaceBetween>
			</Container>

			<Container
				header={
					<Header variant="h2">
						Have you participated or mentored at a hackathon before? If so,
						please list which ones. e.g. IrvineHacks 2024 (Hacker), ZotHacks
						2024 (Mentor)
					</Header>
				}
			>
				{application_data.mentor_prev_experience_saq1
					? application_data.mentor_prev_experience_saq1
					: "No Response"}
			</Container>

			{application_data.mentor_type.includes("is_tech_mentor") && (
				<TechMentorSection
					application_data={application_data}
					guidelines={guidelines}
				/>
			)}

			{application_data.mentor_type.includes("is_design_mentor") && (
				<DesignMentorSection
					application_data={application_data}
					guidelines={guidelines}
				/>
			)}

			<ResponseSection
				title="How would you help participants turn an ambitious idea into something achievable within the hackathon?"
				leftColumn={
					guidelines?.guidelines?.mentor_interest_saq5 && (
						<PortableText value={guidelines.guidelines.mentor_interest_saq5} />
					)
				}
				rightColumn={application_data.mentor_interest_saq5}
			/>

			<ResponseSection
				title="Why are you interested in being a mentor for IrvineHacks 2026? (100+ words recommended)"
				leftColumn={
					guidelines?.guidelines?.mentor_interest_saq2 && (
						<PortableText value={guidelines.guidelines.mentor_interest_saq2} />
					)
				}
				rightColumn={application_data.mentor_interest_saq2}
			/>

			<Container header={<Header variant="h2">Shift Availability</Header>}>
				<ColumnLayout columns={3}>
					<DayShift
						shiftText="Friday"
						startHour={7}
						endHour={24}
						hoursArray={application_data.friday_availability}
					/>
					<DayShift
						shiftText="Saturday"
						startHour={7}
						endHour={24}
						hoursArray={application_data.saturday_availability}
					/>
					<DayShift
						shiftText="Sunday"
						startHour={7}
						endHour={19}
						hoursArray={application_data.sunday_availability}
					/>
				</ColumnLayout>
			</Container>
		</SpaceBetween>
	);
}

export default MentorApplication;
