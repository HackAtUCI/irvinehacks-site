import ColumnLayout from "@cloudscape-design/components/column-layout";
import TextContent from "@cloudscape-design/components/text-content";

import {
	ZotHacksHackerApplicationData,
	ZotHacksHackerApplicationQuestion,
} from "@/lib/admin/useApplicant";

interface ApplicationResponseProps {
	value: string | boolean | string[] | number[] | null | undefined;
}

const titleCase = (str: string) =>
	str.charAt(0).toUpperCase() + str.substring(1);

const formatQuestion = (q: string) => q.split("_").map(titleCase).join(" ");

// Map of hackathon experience values to labels
const HACKATHON_EXPERIENCE_LABELS: Record<string, string> = {
	first_time: "First Time",
	some_experience: "Some Experience",
	veteran: "Veteran",
};

function ApplicationResponse({ value }: ApplicationResponseProps) {
	if (value === null || value === undefined) {
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
			if (value in HACKATHON_EXPERIENCE_LABELS) {
				return <p>{HACKATHON_EXPERIENCE_LABELS[value]}</p>;
			}
			return <p>{value}</p>;
		case "object":
			if (Array.isArray(value)) {
				return (
					<ul>
						{value.map((v) => (
							<li key={v.toString()}>{v}</li>
						))}
					</ul>
				);
			}
			return <p>{JSON.stringify(value)}</p>;
		default:
			return <p />;
	}
}

interface ZotHacksHackerApplicationSectionProps {
	title: string;
	data: Omit<ZotHacksHackerApplicationData, "reviews">;
	propsToShow: ZotHacksHackerApplicationQuestion[];
}

function ZotHacksHackerApplicationSection({
	title,
	data,
	propsToShow,
}: ZotHacksHackerApplicationSectionProps) {
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
						<ApplicationResponse
							value={data[prop] as ApplicationResponseProps["value"]}
						/>
					</div>
				))}
			</ColumnLayout>
		</TextContent>
	);
}

export default ZotHacksHackerApplicationSection;
