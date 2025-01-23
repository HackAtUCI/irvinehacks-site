export default function ResourceDescription({
	description,
	title,
	isMobile,
}: {
	description: string;
	title: string;
	isMobile: boolean;
}) {
	return isMobile ? (
		<div>
			<h2 className="py-[0.7rem] font-display font-bold text-lg sm:text-xl">
				{title}
			</h2>
			<h1 className="mb-6 font-body text-base sm:text-lg">{description}</h1>
		</div>
	) : (
		<h1 className="mb-8 font-body text-xl md:text-2xl">{description}</h1>
	);
}
