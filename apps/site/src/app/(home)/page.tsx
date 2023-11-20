import { Landing, MentorVolunteer } from "./sections";

export default function Home() {
	// Show landing section only if still in maintenance,
	// otherwise show the rest of the sections
	return process.env.MAINTENANCE_MODE_HOME ? (
		<Landing />
	) : (
		<>
			<Landing />
			<MentorVolunteer />
			<div style={{ height: 400 }}></div>
		</>
	);
}
