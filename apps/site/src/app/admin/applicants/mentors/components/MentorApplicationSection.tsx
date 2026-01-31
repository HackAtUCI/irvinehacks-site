import ColumnLayout from "@cloudscape-design/components/column-layout";
import TextContent from "@cloudscape-design/components/text-content";

import {
	IrvineHacksMentorApplicationData,
	IrvineHacksMentorApplicationQuestion,
} from "@/lib/admin/useApplicant";
import { IrvineHacksMentorScoringGuidelinesType } from "./getScoringGuidelines";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import { PortableText } from "@portabletext/react";
import Box from "@cloudscape-design/components/box";
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
			return <p>{value}</p>;
		case "object":
			return (
				<ul>
					{value.map((v) => (
						<li key={v}>{v}</li>
					))}
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
				<ul>
					{application_data?.design_experienced_tools?.map((v) => (
						<li key={v}>{v}</li>
					))}
				</ul>
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
