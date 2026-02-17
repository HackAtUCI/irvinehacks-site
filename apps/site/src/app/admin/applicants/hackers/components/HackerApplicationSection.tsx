import ColumnLayout from "@cloudscape-design/components/column-layout";
import TextContent from "@cloudscape-design/components/text-content";

import {
	IrvineHacksHackerApplicationData,
	ZotHacksHackerApplicationData,
} from "@/lib/admin/useApplicant";

interface ApplicationResponseProps {
	value: string | boolean | string[] | null;
}

const titleCase = (str: string) =>
	str.charAt(0).toUpperCase() + str.substring(1);

const formatQuestion = (q: string) => q.split("_").map(titleCase).join(" ");

const HACKATHON_EXPERIENCE_LABELS: Record<string, string> = {
	first_time: "First Time",
	some_experience: "Some Experience",
	veteran: "Veteran",
};

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
	"high school": "High School",
	"first-year-undergrad": "First Year Undergraduate",
	"second-year-undergrad": "Second Year Undergraduate",
	"third-year-undergrad": "Third Year Undergraduate",
	"fourth-year-undergrad": "Fourth Year Undergraduate",
	"fifth-year-undergrad": "Fifth Year Undergraduate",
	graduate: "Graduate",
};

const PRONOUNS_LABELS: Record<string, string> = {
	he: "He/him/his",
	she: "She/her/hers",
	hey: "They/them/theirs",
};

const DIETARY_RESTRICTION_LABELS: Record<string, string> = {
	anything: "I can eat anything, including the following: chicken, beef, pork",
	no_beef: "No Beef",
	no_pork: "No Pork",
	vegetarian: "Vegetarian",
	vegan: "Vegan",
	gluten_free: "Gluten-Free",
};

const IH_REFERENCE_LABELS: Record<string, string> = {
	aif: "AIF",
	discord: "Discord",
	instagram: "Instagram",
	classes: "Classes",
	word_of_mouth: "Word of Mouth",
};

const AREAS_INTERESTED_LABELS: Record<string, string> = {
	software: "Software",
	ai: "AI/ML",
	hardware: "Hardware",
	infrastructure: "Infrastructure",
	industry: "Industry",
};

const LIST_LABELS: Record<string, string> = {
	...PRONOUNS_LABELS,
	...IH_REFERENCE_LABELS,
	...AREAS_INTERESTED_LABELS,
	...DIETARY_RESTRICTION_LABELS,
};

const SINGLE_ANSWER_LABELS: Record<string, string> = {
	...HACKATHON_EXPERIENCE_LABELS,
	...EDUCATION_LEVEL_LABELS,
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
						if (v in LIST_LABELS) {
							return (
								<li key={v}>{LIST_LABELS[v as keyof typeof LIST_LABELS]}</li>
							);
						}

						return <li key={v}>{v}</li>;
					})}
				</ul>
			);
		default:
			return <p />;
	}
}

type BaseData =
	| Omit<IrvineHacksHackerApplicationData, "reviews">
	| Omit<ZotHacksHackerApplicationData, "reviews">;

function HackerApplicationSection<
	T extends BaseData,
	K extends keyof T & string,
>({ title, data, propsToShow }: { title: string; data: T; propsToShow: K[] }) {
	return (
		<TextContent>
			<h3>{title}</h3>
			<ColumnLayout
				columns={Math.min(propsToShow.length, 4)}
				variant="text-grid"
			>
				{propsToShow.map((prop) => (
					<div key={prop}>
						<h4>{formatQuestion(prop as string)}</h4>
						<ApplicationResponse
							value={data[prop] as string | boolean | string[] | null}
						/>
					</div>
				))}
			</ColumnLayout>
		</TextContent>
	);
}

export default HackerApplicationSection;
