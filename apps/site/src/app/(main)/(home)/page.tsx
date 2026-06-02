import Landing from "./sections/Landing/Landing";
import About from "./sections/About/About";

export const revalidate = 60;

export default function Home() {
	return process.env.MAINTENANCE_MODE_HOME ? (
		<Landing />
	) : (
		<>
			<Landing />
			<About />
		</>
	);
}
