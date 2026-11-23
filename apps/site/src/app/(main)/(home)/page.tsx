import ComingSoonHero from "./sections/ComingSoon/ComingSoonHero";
import InterestFormsSection from "./sections/ComingSoon/InterestFormsSection";
import FAQ from "./sections/FAQ/FAQ";

export const revalidate = 60;

export default function Home() {
	return (
		<main className="w-full bg-cream">
			<ComingSoonHero />
			<InterestFormsSection />
			<FAQ />
		</main>
	);
}
