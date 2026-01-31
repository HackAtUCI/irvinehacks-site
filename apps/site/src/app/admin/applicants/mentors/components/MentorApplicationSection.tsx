import { PortableText } from "@portabletext/react";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import TextContent from "@cloudscape-design/components/text-content";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Box from "@cloudscape-design/components/box";

import {
	IrvineHacksMentorApplicationData,
	IrvineHacksMentorApplicationQuestion,
} from "@/lib/admin/useApplicant";
import { IrvineHacksMentorScoringGuidelinesType } from "./getScoringGuidelines";
import ResponseSection from "../../components/ResponseSection";

interface ApplicationResponseProps {
	value:
		| string
		| boolean
		| string[]
		| readonly string[]
		| readonly number[]
		| null;
}

const titleCase = (str: string) =>
	str.charAt(0).toUpperCase() + str.substring(1);

const formatQuestion = (q: string) => q.split("_").map(titleCase).join(" ");

const MENTOR_TYPE_LABELS: Record<string, string> = {
	is_tech_mentor: "Tech",
	is_design_mentor: "Design",
};

const PRONOUNS_LABELS: Record<string, string> = {
	he: "He/him/his",
	she: "She/her/hers",
	they: "They/them/theirs",
	other: "Other",
};

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
	"high school": "High School (18+)",
	"first-year-undergrad": "First Year Undergraduate",
	"second-year-undergrad": "Second Year Undergraduate",
	"third-year-undergrad": "Third Year Undergraduate",
	"fourth-year-undergrad": "Fourth Year Undergraduate",
	"fifth-year-undergrad": "Fifth+ Year Undergraduate",
	graduate: "Graduate",
};

const DIETARY_RESTRICT_LABELS: Record<string, string> = {
	anything: "I can eat anything",
	vegetarian: "Vegetarian",
	vegan: "Vegan",
	no_beef: "No Beef",
	no_pork: "No Pork",
	gluten_free: "Gluten-free",
	other: "Other",
};

const IH_REFERENCE_LABELS: Record<string, string> = {
	aif: "Anteater Involvement Fair (AIF)",
	discord: "Discord",
	instagram: "Instagram",
	classes: "Classes (Ed, Canvas, Announcements, etc.)",
	word_of_mouth: "Word of Mouth",
	other: "Other",
};

const RESUME_SHARE_LABELS: Record<string, string> = {
	yes: "Yes",
	no: "No",
};

const TECH_EXP_LABELS: Record<string, string> = {
	python: "Python",
	java: "Java",
	cpp: "C++",
	javascript: "JavaScript",
	typescript: "TypeScript",
	html_css: "HTML/CSS",
	react: "React.js",
	nextjs: "Next.js",
	csharp: "C#",
	unity: "Unity UE5",
	godot: "Godot",
	git: "Git",
	sql: "SQL",
	aws: "AWS",
	vercel: "Vercel",
};

const HARDWARE_EXP_LABELS: Record<string, string> = {
	arduino: "Arduino",
	arduino_ide: "Arduino IDE",
	embedded_c_cpp: "Embedded C/C++",
	embedded_systems: "Embedded Systems",
	breadboard_circuits: "Breadboard Circuits",
	circuit_prototyping: "Circuit Prototyping",
	sensors_actuators: "Sensors & Actuators",
	multimeter: "Multimeter",
	reading_datasheets: "Reading Datasheets",
	serial_communication: "Serial Communication (UART/I2C/SPI)",
	hardware_debugging: "Hardware Debugging",
	power_management: "Power Management",
};

const DESIGN_TOOL_LABELS: Record<string, string> = {
	figma: "Figma",
	affinity: "Affinity",
	photoshop: "Adobe Photoshop",
	illustrator: "Illustrator",
	framer: "Framer",
	indesign: "Adobe InDesign",
};

const LIST_LABELS: Record<string, string> = {
	...MENTOR_TYPE_LABELS,
	...PRONOUNS_LABELS,
	...DIETARY_RESTRICT_LABELS,
	...IH_REFERENCE_LABELS,
	...TECH_EXP_LABELS,
	...HARDWARE_EXP_LABELS,
	...DESIGN_TOOL_LABELS,
};

const SINGLE_ANSWER_LABELS: Record<string, string> = {
	...EDUCATION_LEVEL_LABELS,
	...RESUME_SHARE_LABELS,
};

function ApplicationResponse({ value }: ApplicationResponseProps) {
	if (value === null) {
		return <p>Not provided</p>;
	}

	switch (typeof value) {
		case "boolean":
			return <p>{value ? "Yes" : "No"}</p>;
		case "string":
			if (value.startsWith("http")) {
				return (
					<p>
						<a href={value} target="_blank" rel="noopener noreferrer">
							{value}
						</a>
					</p>
				);
			}

			if (value in SINGLE_ANSWER_LABELS) {
				return (
					<p>
						{SINGLE_ANSWER_LABELS[value as keyof typeof SINGLE_ANSWER_LABELS]}
					</p>
				);
			}

			return <p>{value}</p>;
		case "object":
			return (
				<ul>
					{value.map((v) => {
						const stringV = String(v);
						if (stringV in LIST_LABELS) {
							return (
								<li key={stringV}>
									{LIST_LABELS[stringV as keyof typeof LIST_LABELS]}
								</li>
							);
						}
						return <li key={stringV}>{stringV}</li>;
					})}
				</ul>
			);
		default:
			return <p />;
	}
}

export function TechMentorSection({
	application_data,
	guidelines,
}: {
	application_data: IrvineHacksMentorApplicationData;
	guidelines?: IrvineHacksMentorScoringGuidelinesType;
}) {
	return (
		<SpaceBetween direction="vertical" size="m">
			<Container header={<Header variant="h2">Tech Section</Header>}>
				<ColumnLayout columns={4} variant="text-grid">
					<div>
						<h4>Github</h4>
						{application_data.github ? (
							<a
								href={application_data.github}
								target="_blank"
								rel="noopener noreferrer"
							>
								{application_data.github}
							</a>
						) : (
							"No Response"
						)}
					</div>
					<div>
						<h4>Portfolio</h4>
						{application_data.portfolio ? (
							<a
								href={application_data.portfolio}
								target="_blank"
								rel="noopener noreferrer"
							>
								{application_data.portfolio}
							</a>
						) : (
							"No Response"
						)}
					</div>
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
				{guidelines?.guidelines?.mentor_prev_experience_saq1 && (
					<PortableText
						value={guidelines.guidelines.mentor_prev_experience_saq1}
					/>
				)}
				<ColumnLayout columns={2} borders="vertical">
					<Box>
						<Header variant="h3">Tech</Header>
						<ApplicationResponse
							value={application_data.tech_experienced_technologies}
						/>
					</Box>

					<Box>
						<Header variant="h3">Hardware</Header>
						<ApplicationResponse
							value={application_data.hardware_experienced_technologies}
						/>
					</Box>
				</ColumnLayout>
			</Container>

			<ResponseSection
				title="How would you go about helping a team that is struggling with a bug?"
				leftColumn={
					guidelines?.guidelines?.mentor_tech_saq3 && (
						<PortableText value={guidelines.guidelines.mentor_tech_saq3} />
					)
				}
				rightColumn={application_data.mentor_tech_saq3}
			/>
		</SpaceBetween>
	);
}

export function DesignMentorSection({
	application_data,
	guidelines,
}: {
	application_data: IrvineHacksMentorApplicationData;
	guidelines?: IrvineHacksMentorScoringGuidelinesType;
}) {
	return (
		<SpaceBetween direction="vertical" size="m">
			<Container header={<Header variant="h2">Design Section</Header>}>
				<ColumnLayout columns={4} variant="text-grid">
					<div>
						<h4>Github</h4>
						{application_data.github ? (
							<a
								href={application_data.github}
								target="_blank"
								rel="noopener noreferrer"
							>
								{application_data.github}
							</a>
						) : (
							"No Response"
						)}
					</div>
					<div>
						<h4>Portfolio</h4>
						{application_data.portfolio ? (
							<a
								href={application_data.portfolio}
								target="_blank"
								rel="noopener noreferrer"
							>
								{application_data.portfolio}
							</a>
						) : (
							"No Response"
						)}
					</div>
					<div>
						<h4>Figma Experience</h4>
						<p>{application_data.figma_experience} / 5</p>
					</div>
				</ColumnLayout>
			</Container>
			<Container header={<Header variant="h2">List of Design Tools</Header>}>
				{guidelines?.guidelines?.mentor_prev_experience_saq1 && (
					<PortableText
						value={guidelines.guidelines.mentor_prev_experience_saq1}
					/>
				)}
				<ApplicationResponse
					value={application_data.design_experienced_tools}
				/>
			</Container>
			<ResponseSection
				title="How would you go about helping a team that is struggling with a design problem?"
				leftColumn={
					guidelines?.guidelines?.mentor_design_saq4 && (
						<PortableText value={guidelines.guidelines.mentor_design_saq4} />
					)
				}
				rightColumn={application_data.mentor_design_saq4}
			/>
		</SpaceBetween>
	);
}

interface ApplicationSectionProps {
	title: string;
	data: Omit<IrvineHacksMentorApplicationData, "reviews">;
	propsToShow: IrvineHacksMentorApplicationQuestion[];
}

function MentorApplicationSection({
	title,
	data,
	propsToShow,
}: ApplicationSectionProps) {
	return (
		<TextContent>
			<h3>{title}</h3>
			<ColumnLayout
				columns={Math.min(propsToShow.length, 4)}
				variant="text-grid"
			>
				{propsToShow.map((prop) => (
					<div key={prop}>
						<h4>{formatQuestion(prop)}</h4>
						<ApplicationResponse value={data[prop]} />
					</div>
				))}
			</ColumnLayout>
		</TextContent>
	);
}

export default MentorApplicationSection;
