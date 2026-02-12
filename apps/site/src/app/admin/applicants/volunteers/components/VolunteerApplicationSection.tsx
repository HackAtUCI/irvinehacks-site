import ColumnLayout from "@cloudscape-design/components/column-layout";
import TextContent from "@cloudscape-design/components/text-content";

import {
	VolunteerApplicationData,
	VolunteerApplicationQuestion,
} from "@/lib/admin/useApplicant";

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

const LIST_LABELS: Record<string, string> = {
	...PRONOUNS_LABELS,
	...DIETARY_RESTRICT_LABELS,
	...IH_REFERENCE_LABELS,
};

const SINGLE_ANSWER_LABELS: Record<string, string> = {
	...EDUCATION_LEVEL_LABELS,
};

interface ApplicationResponseProps {
	value: string | number | boolean | string[] | ReadonlyArray<number> | null;
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

interface ApplicationSectionProps {
	title: string;
	data: Omit<VolunteerApplicationData, "reviews">;
	propsToShow: VolunteerApplicationQuestion[];
}

function VolunteerApplicationSection({
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

export default VolunteerApplicationSection;
