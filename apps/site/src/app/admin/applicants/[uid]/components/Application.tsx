import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { Applicant, ApplicationQuestion } from "@/lib/admin/useApplicant";

import ApplicationSection from "./ApplicationSection";

interface ApplicationSections {
	[key: string]: ApplicationQuestion[];
}

const APPLICATION_SECTIONS: ApplicationSections = {
	"Personal Information": ["pronouns", "ethnicity", "is_18_older"],
	Education: ["school", "education_level", "major", "is_first_hackathon"],
	Experience: ["portfolio", "linkedin", "resume_url"],
	"Free Response Questions": ["frq_collaboration", "frq_dream_job"],
};

interface ApplicationProps {
	applicant: Applicant;
}

function Application({ applicant }: ApplicationProps) {
	const { application_data } = applicant;

	return (
		<Container header={<Header variant="h2">Application</Header>}>
			<SpaceBetween direction="vertical" size="m">
				{Object.entries(APPLICATION_SECTIONS).map(([section, questions]) => (
					<ApplicationSection
						key={section}
						title={section}
						data={application_data}
						propsToShow={questions}
					/>
				))}
			</SpaceBetween>
		</Container>
	);
}

export default Application;
