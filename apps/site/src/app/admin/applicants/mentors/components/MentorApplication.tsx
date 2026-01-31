import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { IrvineHacksMentorApplicationQuestion } from "@/lib/admin/useApplicant";
import MentorApplicationSection from "@/app/admin/applicants/mentors/components/MentorApplicationSection";

import { IrvineHacksMentorApplicationData } from "@/lib/admin/useApplicant";
import ResponseSection from "../../components/ResponseSection";
import { Box, ColumnLayout } from "@cloudscape-design/components";
import DayShift from "../../components/DayShift";

interface MentorApplicationSections {
	[key: string]: IrvineHacksMentorApplicationQuestion[];
}

const MENTOR_APPLICATION_SECTIONS: MentorApplicationSections = {
	"Personal Information": ["mentor_type", "pronouns", "is_18_older"],
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
	return (
		<SpaceBetween direction="vertical" size="m">
			<Container header={<Header variant="h2">Tech Section</Header>}>
				<ColumnLayout columns={2} variant="text-grid">
					<div>
						<h4>Git Experience</h4>
						<p>{application_data.git_experience} / 5</p>
					</div>
					<div>
						<h4>Arduino Experience</h4>
						<p>{application_data.arduino_experience} / 5</p>
					</div>
				</ColumnLayout>
			</Container>
			<Container
				header={<Header variant="h2">List of Technical Skills</Header>}
			>
				<ColumnLayout columns={2} borders="vertical">
					<Box>
						<Header variant="h3">Tech</Header>
						<ul>
							{application_data?.tech_experienced_technologies?.map((v) => (
								<li key={v}>{v}</li>
							))}
						</ul>
					</Box>

					<Box>
						<Header variant="h3">Hardware</Header>
						<ul>
							{application_data?.hardware_experienced_technologies?.map((v) => (
								<li key={v}>{v}</li>
							))}
						</ul>
					</Box>
				</ColumnLayout>
			</Container>

			<ResponseSection
				title="How would you go about helping a team that is struggling with a bug?"
				leftColumn={""}
				rightColumn={application_data.mentor_tech_saq3}
			/>
		</SpaceBetween>
	);
}

function DesignMentorSection({
	application_data,
}: {
	application_data: IrvineHacksMentorApplicationData;
}) {
	return (
		<SpaceBetween direction="vertical" size="m">
			<Container header={<Header variant="h2">Design Section</Header>}>
				<div>
					<h4>Figma Experience</h4>
					<p>{application_data.figma_experience} / 5</p>
				</div>
			</Container>
			<Container header={<Header variant="h2">List of Design Tools</Header>}>
				<ul>
					{application_data?.design_experienced_tools?.map((v) => (
						<li key={v}>{v}</li>
					))}
				</ul>
			</Container>
		</SpaceBetween>
	);
}

function MentorApplication({
	application_data,
}: {
	application_data: IrvineHacksMentorApplicationData;
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
				<TechMentorSection application_data={application_data} />
			)}

			{application_data.mentor_type.includes("is_design_mentor") && (
				<DesignMentorSection application_data={application_data} />
			)}

			<ResponseSection
				title="How would you help participants turn an ambitious idea into something achievable within the hackathon?"
				leftColumn={""}
				rightColumn={application_data.mentor_interest_saq5}
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
