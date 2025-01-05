import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { MentorApplicationQuestion } from "@/lib/admin/useApplicant";
import MentorApplicationSection from "@/app/admin/applicants/mentors/MentorApplicationSection";

import { MentorApplicationData } from "@/lib/admin/useApplicant";

interface MentorApplicationSections {
	[key: string]: MentorApplicationQuestion[];
}

const MENTOR_APPLICATION_SECTIONS: MentorApplicationSections = {
	"Personal Information": ["pronouns", "ethnicity", "is_18_older"],
	Education: ["school", "education_level", "major"],
	Experience: [
		"git_experience",
		"portfolio",
		"linkedin",
		"resume_url",
		"resume_share_to_sponsors",
	],
	"Free Response Questions": [
		"mentor_prev_experience_saq1",
		"mentor_interest_saq2",
		"mentor_team_help_saq3",
		"mentor_team_help_saq4",
		"other_questions",
	],
};

function MentorApplication({
	application_data,
}: {
	application_data: MentorApplicationData;
}) {
	return (
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
	);
}

export default MentorApplication;
