export default function ResourceItem({
	key,
	resourceIconUrl,
	title,
	link,
}: {
	key: string;
	resourceIconUrl: string;
	title: string;
	link: string;
}) {
	return (
		<a
			key={key}
			href={link}
			target="_blank"
			className="flex flex-col items-center justify-center bg-black text-white border border-[3px] border-white transition-all duration-300 hover:bg-white hover:text-black hover:border-black hover:shadow-[9px_9px_0px_1px_#ffffff] w-full h-[200px] xl:h-[240px] flex-grow"
		>
			<div className="h-full py-6 xl:p-6">
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
