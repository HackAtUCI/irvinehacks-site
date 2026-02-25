interface ResourceHeaderProps {
	title: string;
	description: string;
}

export default function ResourceHeader({
	title,
	description,
}: ResourceHeaderProps) {
	return (
		<div className="text-center md:text-start lg:text-start">
			<h1 className="text-2xl md:text-3xl lg:text-4xl font-display mb-2 text-[#00FFFB]">
				{title}
			</h1>
			<p className="text-sm md:text-md lg:text-lg font-body lexend-giga text-[#FFFFFF]">
				{description}
			</p>
		</div>
	);
}
