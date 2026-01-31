import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { IrvineHacksMentorApplicationQuestion } from "@/lib/admin/useApplicant";
import MentorApplicationSection from "@/app/admin/applicants/mentors/components/MentorApplicationSection";

import { IrvineHacksMentorApplicationData } from "@/lib/admin/useApplicant";

interface MentorApplicationSections {
	[key: string]: IrvineHacksMentorApplicationQuestion[];
}

const MENTOR_APPLICATION_SECTIONS: MentorApplicationSections = {
	"Personal Information": ["pronouns", "is_18_older"],
	Education: ["school", "education_level", "major"],
	Experience: ["linkedin", "resume_url", "resume_share_to_sponsors"],
};

// Component for SAQs

// Component for availability from volunteer

// Show different saq questions based on mentor type
function TechMentorSection({
	application_data,
}: {
	application_data: IrvineHacksMentorApplicationData;
}) {
	return <div>tech mentor section</div>;
}

function DesignMentorSection({
	application_data,
}: {
	application_data: IrvineHacksMentorApplicationData;
}) {
	return <div>design mentor section</div>;
}

function MentorApplication({
	application_data,
}: {
	application_data: IrvineHacksMentorApplicationData;
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
				{application_data.mentor_type.includes("tech") && (
					<TechMentorSection application_data={application_data} />
				)}
				{application_data.mentor_type.includes("design") && (
					<DesignMentorSection application_data={application_data} />
				)}
			</SpaceBetween>
		</Container>
	);
}

export default MentorApplication;
