export default function ResourceCategory({
	iconUrl,
	title,
	isMobile,
}: {
	iconUrl: string;
	title: string;
	isMobile: boolean;
}) {
	return isMobile ? (
		<img className="h-32 w-32 sm:h-40 sm:w-40" src={iconUrl} alt={title} />
	) : (
		<div className="grow basis-0 select-none pointer-events-none">
			<img className="mx-auto h-auto w-8 md:w-80" src={iconUrl} alt={title} />
			<div className="align-center justify-items-center">
				<div className="top-1 left-1 w-full h-full bg-white " />
				<h2 className="border-solid border-white border-[3px] bg-black px-10 py-[0.7rem] font-display text-center font-bold text-[calc(13px_+_1vw)] shadow-[8px_8px_0px_1px_#ffffff]">
					{title}
				</h2>
			</div>
		</div>
	);
}
