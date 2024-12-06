import TriangleIcon from "./TriangleIcon";

export default function ListItemButton({
	onClick,
	text,
	className,
	rotate,
	displace,
	inverted,
}: {
	onClick: () => void;
	text: string | React.ReactNode;
	className?: string;
	rotate?: string;
	displace?: number;
	inverted: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex gap-3 duration-200 p-[5px] lg:p-[3px] xl:p-[4px] group ${
				inverted ? "bg-white" : "hover:bg-white"
			} ${className}`}
		>
			<TriangleIcon
				className={`sm:w-3 sm:h-3 md:w-4 md:h-4 xl:w-5 xl:h-5 mt-[${displace}px] lg:mt-[2px] visible group-hover:hidden ${rotate}`}
				dark={inverted ? true : inverted}
			/>
			<TriangleIcon
				className={`sm:w-3 sm:h-3 md:w-4 md:h-4 xl:w-5 xl:h-5 mt-[${displace}px] lg:mt-[2px] hidden group-hover:block ${rotate}`}
				dark={inverted ? true : !inverted}
			/>
			<p
				className={`w-fit font-light text-left mb-0 ${
					inverted ? "text-[#0C071B]" : "text-white group-hover:text-[#0C071B]"
				}`}
			>
				{text}
			</p>
		</button>
	);
}
