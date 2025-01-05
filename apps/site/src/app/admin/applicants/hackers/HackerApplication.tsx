import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { HackerApplicationQuestion } from "@/lib/admin/useApplicant";
import HackerApplicationSection from "@/app/admin/applicants/hackers/HackerApplicationSection";

import { HackerApplicationData } from "@/lib/admin/useApplicant";

interface HackerApplicationSections {
	[key: string]: HackerApplicationQuestion[];
}

const HACKER_APPLICATION_SECTIONS: HackerApplicationSections = {
	"Personal Information": ["pronouns", "ethnicity", "is_18_older"],
	Education: ["school", "education_level", "major", "is_first_hackathon"],
	Experience: ["portfolio", "linkedin", "resume_url"],
	"Free Response Questions": ["frq_change", "frq_video_game"],
};

function HackerApplication({
	application_data,
}: {
	application_data: HackerApplicationData;
}) {
	return (
		<Container header={<Header variant="h2">Hacker Application</Header>}>
			<SpaceBetween direction="vertical" size="m">
				{Object.entries(HACKER_APPLICATION_SECTIONS).map(
					([section, questions]) => (
						<HackerApplicationSection
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

export default HackerApplication;
