import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";

import PixelArtDisplay from "./PixelArtDisplay";
import HackerApplicationSection from "@/app/admin/applicants/hackers/components/HackerApplicationSection";
import { ZotHacksHackerApplicationData } from "@/lib/admin/useApplicant";
import ScoreSection from "../../components/ScoreSection";

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
	// "Short Answer Questions": [
	// 	"elevator_pitch_saq",
	// 	"tech_experience_saq",
	// 	"learn_about_self_saq",
	// 	"pixel_art_saq",
	// ],
	// "Pixel Art": ["pixel_art_data"],
	Comments: ["comments"],
};

function ZotHacksHackerApplication({
	application_data,
}: {
	application_data: ZotHacksHackerApplicationData;
}) {
	return (
		<SpaceBetween direction="vertical" size="m">
			<Header variant="h2">ZotHacks Hacker Application</Header>
			<Container>
				{Object.entries(ZH_HACKER_APPLICATION_SECTIONS).map(
					([section, propsToShow]) => (
						<HackerApplicationSection
							key={section}
							title={section}
							data={application_data}
							propsToShow={propsToShow}
						/>
					),
				)}
			</Container>
			<ScoreSection
				title="If you had 30 seconds in an elevator with your dream mentor, how would
					you explain why you’re joining ZotHacks? [75 word limit]"
				min={0}
				max={20}
				leftColumn={<p>0 is bad. 20 is amazing.</p>}
				rightColumn={<p>{application_data.elevator_pitch_saq}</p>}
			/>
			<ScoreSection
				title="Describe a positive or negative experience dealing with technology
					[100 words]"
				min={0}
				max={20}
				leftColumn={<p>0 is bad. 20 is amazing.</p>}
				rightColumn={<p>{application_data.tech_experience_saq}</p>}
			/>
			<ScoreSection
				title="What’s one thing you hope to learn about yourself at UCI — and how
					might ZotHacks help with that? [100 words]"
				min={0}
				max={20}
				leftColumn={<p>0 is bad. 20 is amazing.</p>}
				rightColumn={<p>{application_data.learn_about_self_saq}</p>}
			/>
			<ScoreSection
				title="Pixel art: Draw something that represents you. Briefly explain your
					art. [100 words]"
				min={0}
				max={20}
				leftColumn={<p>0 is bad. 20 is amazing.</p>}
				rightColumn={
					<div>
						<p>{application_data.pixel_art_saq}</p>
						<PixelArtDisplay gridColors={application_data.pixel_art_data} />
					</div>
				}
			/>
		</SpaceBetween>
	);
}

export default ZotHacksHackerApplication;
