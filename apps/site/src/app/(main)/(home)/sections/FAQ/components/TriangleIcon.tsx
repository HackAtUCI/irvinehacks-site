export default function TriangleIcon({
	className,
	dark = false,
}: {
	className?: string;
	dark?: boolean;
}) {
	return (
		<svg
			width="12"
			height="14"
			viewBox="0 0 12 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M12 7L0 13.0622L0 0.937822L12 7Z"
				fill={dark ? "black" : "white"}
			/>
		</svg>
	);
}
