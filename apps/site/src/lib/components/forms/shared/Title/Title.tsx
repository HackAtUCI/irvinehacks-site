interface TitleProps {
	applicationType: "Hacker" | "Mentor" | "Volunteer";
}

export default function Title({ applicationType }: TitleProps) {
	const applyTitle = `Apply as a ${applicationType}`;

	return (
		<>
			<h1
				className="text-[var(--color-yellow)] text-center font-heading text-3xl md:text-5xl"
				style={{ textShadow: "0 0 20px var(--color-yellow)" }}
			>
				{applyTitle}
			</h1>
			<h2 className="text-[var(--color-offwhite)] text-center font-body text-xl my-6 sm:text-2xl md:text-4xl">
				Applications close on January 12th, 11:59PM PST
			</h2>
		</>
	);
}
