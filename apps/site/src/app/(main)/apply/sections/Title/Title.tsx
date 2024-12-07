interface TitleProps {
	applicationType: "Hacker" | "Mentor" | "Volunteer";
}

export default function Title({ applicationType }: TitleProps) {
	return (
		<>
			<h1 className="text-[var(--color-white)] text-center font-display font-bold text-3xl md:text-5xl ">
				Apply as a {applicationType}
			</h1>
			<h2 className="text-[var(--color-offwhite)] text-center font-body text-xl sm:text-2xl md:text-4xl lg:my-6">
				Applications close on January 10th, 11:59PM PST
			</h2>
		</>
	);
}
