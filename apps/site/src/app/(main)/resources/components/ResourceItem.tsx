export default function ResourceItem({
	key,
	resourceIconUrl,
	title,
	link,
	isMobile,
}: {
	key: string;
	resourceIconUrl?: string;
	title: string;
	link: string;
	isMobile: boolean;
}) {
	return isMobile ? (
		<a
			key={key}
			href={link}
			target="_blank"
			className="bg-[rgba(20,40,90,0.45)] backdrop-blur-[12px] text-center w-full max-w-[300px] my-0.5 p-3 flex flex-col items-center justify-center text-xl sm:text-2xl text-white border border-2 border-yellow transition-all duration-300 hover:bg-white hover:text-black hover:scale-105"
		>
			{title}
		</a>
	) : (
		<a
			key={key}
			href={link}
			target="_blank"
			className="bg-[rgba(20,40,90,0.45)] backdrop-blur-[12px] my-2 flex flex-col items-center justify-center text-white border border-[3px] border-yellow transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 w-[200px] lg:w-[225px] h-[200px] xl:h-[240px] flex-grow"
		>
			<div className="h-full py-6 xl:p-6">
				{/* eslint-disable-next-line @next/next/no-img-element*/}
				<img
					className="pointer-events-none w-[90px] h-[90px] xl:w-[130px] xl:h-[130px]"
					src={resourceIconUrl}
					alt={title}
				/>
			</div>
			<div className="flex flex-wrap text-center px-2">
				<p className="text-md lg:text-lg font-medium">{title}</p>
			</div>
		</a>
	);
}
