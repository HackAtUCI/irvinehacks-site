import ComingSoonHero from "./sections/ComingSoon/ComingSoonHero";
import InterestFormsSection from "./sections/ComingSoon/InterestFormsSection";
import TeamSection from "./sections/Team/TeamSection";

export const revalcidate = 60;

export default function Home() {
	return (
		<main className="w-full bg-cream">
			<ComingSoonHero />
			<InterestFormsSection />
			<TeamSection />
		</main>
	);
}
