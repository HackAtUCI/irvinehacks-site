import { Landing, MentorVolunteer, FAQ } from "./sections";

export const revalidate = 60;

export default function Home() {
	// Show landing section only if still in maintenance,
	// otherwise show the rest of the sections
	return process.env.MAINTENANCE_MODE_HOME ? (
		<Landing />
	) : (
		<>
			<Landing />
			<MentorVolunteer />
			<FAQ />
		</>
	);
}
