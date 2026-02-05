import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import ColumnLayout from "@cloudscape-design/components/column-layout";

import {
	VolunteerApplicationQuestion,
	VolunteerApplicationData,
} from "@/lib/admin/useApplicant";
import VolunteerApplicationSection from "@/app/admin/applicants/volunteers/components/VolunteerApplicationSection";
import DayShift from "../../components/DayShift";
import CharacterDisplay from "../../components/CharacterDisplay";

interface VolunteerApplicationSections {
	[key: string]: VolunteerApplicationQuestion[];
}

const VOLUNTEER_APPLICATION_SECTIONS: VolunteerApplicationSections = {
	"Personal Information": [
		"pronouns",
		"is_18_older",
		"t_shirt_size",
		"dietary_restrictions",
		"allergies",
		"ih_reference",
	],
	Education: ["school", "education_level", "major"],
};

function SAQSection({
	question,
	response,
}: {
	question: string;
	response: string;
}) {
	return (
		<Container header={<Header variant="h2">{question}</Header>}>
			<p>{response}</p>
		</Container>
	);
}

function VolunteerApplication({
	application_data,
}: {
	application_data: VolunteerApplicationData;
}) {
	return (
		<SpaceBetween direction="vertical" size="m">
			<Container header={<Header variant="h2">Volunteer Application</Header>}>
				<SpaceBetween direction="vertical" size="m">
					{Object.entries(VOLUNTEER_APPLICATION_SECTIONS).map(
						([section, questions]) => (
							<VolunteerApplicationSection
								key={section}
								title={section}
								data={application_data}
								propsToShow={questions}
							/>
						),
					)}
				</SpaceBetween>
			</Container>

			<SAQSection
				question="Why are you interested in volunteering, and what do you expect to gain from this experience? (max word count 150)"
				response={application_data.frq_volunteer}
			/>
			<SAQSection
				question="If memories could be edited like a video, which memory would you never want to change and why? (max word count 100)"
				response={application_data.frq_memory}
			/>
			<SAQSection
				question="If you are tasked to serve food, do you have any allergies we should be aware of? If so, please explain the severity of each allergy."
				response={application_data.frq_volunteer_allergy ?? "N/A"}
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

			<CharacterDisplay
				headIndex={application_data.character_head_index}
				bodyIndex={application_data.character_body_index}
				feetIndex={application_data.character_feet_index}
				companionIndex={application_data.character_companion_index}
			/>
		</SpaceBetween>
	);
}

export default VolunteerApplication;
