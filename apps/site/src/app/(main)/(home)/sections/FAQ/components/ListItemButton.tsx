import TriangleIcon from "./TriangleIcon";

export default function ListItemButton({
	onClick,
	text,
	className,
	rotate,
	inverted,
}: {
	onClick: () => void;
	text: string | React.ReactNode;
	className?: string;
	rotate?: string;
	inverted: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex items-center gap-3 duration-300 p-[5px] lg:p-[4px] xl:p-[4px] group ${
				inverted ? "bg-white" : "hover:bg-white"
			} ${className}`}
		>
			<TriangleIcon
				className={`sm:w-4 sm:h-4 md:w-5 md:h-5 xl:w-5 xl:h-5 visible group-hover:hidden ${rotate}`}
				dark={inverted}
			/>
			<TriangleIcon
				className={`sm:w-4 sm:h-4 md:w-5 md:h-5 xl:w-5 xl:h-5 hidden group-hover:block ${rotate}`}
				dark
			/>
			<p
				className={`w-fit font-light text-left mb-0 ${
					inverted
						? "text-[var(--color-black)]"
						: "text-white group-hover:text-[var(--color-black)]"
				}`}
			>
				{text}
			</p>
		</button>
	);
}
