import ColumnLayout from "@cloudscape-design/components/column-layout";
import TextContent from "@cloudscape-design/components/text-content";

import { ApplicationData, ApplicationQuestion } from "admin/utils/useApplicant";

interface ApplicationResponseProps {
	value: string | boolean | string[] | null;
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

interface ApplicationSectionProps {
	title: string;
	data: Omit<ApplicationData, "reviews">;
	propsToShow: ApplicationQuestion[];
}

function ApplicationSection({
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

export default ApplicationSection;
