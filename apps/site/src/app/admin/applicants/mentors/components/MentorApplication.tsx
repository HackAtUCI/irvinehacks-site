import { PortableText } from "@portabletext/react";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import ColumnLayout from "@cloudscape-design/components/column-layout";

import {
	IrvineHacksMentorApplicationQuestion,
	IrvineHacksMentorApplicationData,
	ZotHacksMentorApplicationData,
} from "@/lib/admin/useApplicant";
import MentorApplicationSection, {
	ApplicationResponse,
	TechMentorSection,
	DesignMentorSection,
} from "@/app/admin/applicants/mentors/components/MentorApplicationSection";
import ResponseSection from "../../components/ResponseSection";
import DayShift from "../../components/DayShift";
import { IrvineHacksMentorScoringGuidelinesType } from "./getScoringGuidelines";
import CharacterDisplay from "../../components/CharacterDisplay";

interface MentorApplicationSections {
	[key: string]: IrvineHacksMentorApplicationQuestion[];
}

type MentorApplicationData =
	| IrvineHacksMentorApplicationData
	| ZotHacksMentorApplicationData;

const MENTOR_APPLICATION_SECTIONS: MentorApplicationSections = {
	"Personal Information": [
		"mentor_type",
		"pronouns",
		"is_18_older",
		"t_shirt_size",
		"dietary_restrictions",
		"allergies",
		"ih_reference",
	],
	Education: ["school", "education_level", "major"],
	Experience: ["linkedin", "resume_url", "resume_share_to_sponsors"],
};

const ZOTHACKS_MENTOR_SECTIONS: {
	title: string;
	fields: Array<Exclude<keyof ZotHacksMentorApplicationData, "reviews">>;
}[] = [
	{
		title: "Personal Information",
		fields: [
			"pronouns",
			"is_18_older",
			"discord_username",
			"phone_number",
			"dietary_restrictions",
			"allergies",
		],
	},
	{
		title: "Education",
		fields: ["academic_status", "major"],
	},
	{
		title: "Experience",
		fields: ["linkedin", "github", "portfolio", "resume_url"],
	},
	{
		title: "Technical Skills",
		fields: [
			"skill_python",
			"skill_java",
			"skill_c__",
			"skill_javascript",
			"other_languages_name",
			"skill_html_css",
			"skill_react_js",
			"skill_next_js_vite",
			"skill_fastapi_node_js",
			"other_frameworks_name",
			"skill_git",
			"skill_sql__any_variation_",
			"skill_aws_services",
			"skill_vercel_github_pages",
			"other_tools_platforms_name",
		],
	},
];

function isZotHacksMentorApplicationData(
	application_data: MentorApplicationData,
): application_data is ZotHacksMentorApplicationData {
	return "tech_stack_frq" in application_data;
}

function formatZotHacksQuestion(question: string) {
	return question
		.replace("skill_c__", "skill_c_plus_plus")
		.replace("skill_sql__any_variation_", "skill_sql_any_variation")
		.split("_")
		.map((word) =>
			word === "frq" ? "FRQ" : word.charAt(0).toUpperCase() + word.substring(1),
		)
		.join(" ");
}

function ZotHacksMentorApplication({
	application_data,
}: {
	application_data: ZotHacksMentorApplicationData;
}) {
	return (
		<SpaceBetween direction="vertical" size="m">
			<Container
				header={<Header variant="h2">ZotHacks Mentor Application</Header>}
			>
				<SpaceBetween direction="vertical" size="m">
					{ZOTHACKS_MENTOR_SECTIONS.map(({ title, fields }) => (
						<div key={title}>
							<h3>{title}</h3>
							<ColumnLayout
								columns={Math.min(fields.length, 4)}
								variant="text-grid"
							>
								{fields.map((field) => (
									<div key={field}>
										<h4>{formatZotHacksQuestion(field)}</h4>
										<ApplicationResponse value={application_data[field]} />
									</div>
								))}
							</ColumnLayout>
						</div>
					))}
				</SpaceBetween>
			</Container>

			<ResponseSection
				title="What tech stack experience do you have?"
				leftColumn={null}
				rightColumn={application_data.tech_stack_frq}
			/>
			<ResponseSection
				title="Given the stack that you mentioned, how do you usually go about connecting the front-end with the back-end?"
				leftColumn={null}
				rightColumn={application_data.frontend_backend_frq}
			/>
			<ResponseSection
				title="Tell us about a time you taught someone a subject that they had limited knowledge of."
				leftColumn={null}
				rightColumn={application_data.teaching_experience_frq}
			/>
			<ResponseSection
				title="If your team had different working styles and experience levels, how would you lead them effectively while keeping everyone engaged?"
				leftColumn={null}
				rightColumn={application_data.team_leadership_frq}
			/>
			<ResponseSection
				title="Questions, comments, or concerns?"
				leftColumn={null}
				rightColumn={application_data.comments || "No Response"}
			/>
		</SpaceBetween>
	);
}

function MentorApplication({
	application_data,
	guidelines,
}: {
	application_data: MentorApplicationData;
	guidelines?: IrvineHacksMentorScoringGuidelinesType;
}) {
	if (isZotHacksMentorApplicationData(application_data)) {
		return <ZotHacksMentorApplication application_data={application_data} />;
	}

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

			<CharacterDisplay
				headIndex={application_data.character_head_index}
				bodyIndex={application_data.character_body_index}
				feetIndex={application_data.character_feet_index}
				companionIndex={application_data.character_companion_index}
			/>
		</SpaceBetween>
	);
}

export default MentorApplication;
