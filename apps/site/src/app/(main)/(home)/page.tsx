import ComingSoonHero from "./sections/ComingSoon/ComingSoonHero";
import InterestFormsSection from "./sections/ComingSoon/InterestFormsSection";

export const revalidate = 60;

export default function Home() {
	return (
		<main className="w-full bg-cream">
			<ComingSoonHero />
			<InterestFormsSection />
		</main>
	);
}
