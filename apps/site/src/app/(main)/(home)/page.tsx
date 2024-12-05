import {
	About,
	Landing,
	ChooseCharacter,
	FAQ,
	Sponsors,
	Partners,
} from "./sections";

export const revalidate = 60;

export default function Home() {
	// Show landing section only if still in maintenance,
	// otherwise show the rest of the sections
	return process.env.MAINTENANCE_MODE_HOME ? (
		<Landing />
	) : (
		<>
			<Landing />
			<About />
			<ChooseCharacter />
			<FAQ />
			<Sponsors />
			<Partners />
		</>
	);
}
