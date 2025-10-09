import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";

import PixelArtDisplay from "./PixelArtDisplay";
import HackerApplicationSection from "@/app/admin/applicants/hackers/components/HackerApplicationSection";
import { ZotHacksHackerApplicationData } from "@/lib/admin/useApplicant";

type ZHKeys = Exclude<keyof ZotHacksHackerApplicationData, "reviews">;

interface ZHHackerApplicationSections {
	[key: string]: ZHKeys[];
}

const ZH_HACKER_APPLICATION_SECTIONS: ZHHackerApplicationSections = {
	"Personal Information": [
		"pronouns",
		"is_18_older",
		"dietary_restrictions",
		"allergies",
	],
	Education: ["school_year", "major"],
	"Hackathon Experience": ["hackathon_experience"],
	"Short Answer Questions": [
		"elevator_pitch_saq",
		"tech_experience_saq",
		"learn_about_self_saq",
		"pixel_art_saq",
	],
	"Pixel Art": ["pixel_art_data"],
	Comments: ["comments"],
};

function ZotHacksHackerApplication({
	application_data,
}: {
	application_data: ZotHacksHackerApplicationData;
}) {
	return (
		<Container
			header={<Header variant="h2">ZotHacks Hacker Application</Header>}
		>
			<SpaceBetween direction="vertical" size="m">
				{Object.entries(ZH_HACKER_APPLICATION_SECTIONS).map(
					([section, propsToShow]) => {
						if (section === "Pixel Art") {
							return (
								<TextContent key={section}>
									<h3>Pixel Art</h3>
									<PixelArtDisplay
										gridColors={application_data.pixel_art_data}
									/>
								</TextContent>
							);
						}

						return (
							<HackerApplicationSection
								key={section}
								title={section}
								data={application_data}
								propsToShow={propsToShow}
							/>
						);
					},
				)}
			</SpaceBetween>
		</Container>
	);
}

export default ZotHacksHackerApplication;
