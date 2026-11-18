interface StickerTextProps {
	text: string;
	strokeWidth?: number;
	className?: string;
}

export default function StickerText({
	text,
	strokeWidth = 7,
	className = "",
}: StickerTextProps) {
	const hasPosition = /\b(absolute|fixed|sticky)\b/.test(className);

	return (
		<span
			className={`${hasPosition ? "" : "relative "}inline-block ${className}`}
		>
			<span className="text-transparent">{text}</span>
			<svg
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
			>
				<text
					x="50%"
					y="50%"
					dominantBaseline="central"
					textAnchor="middle"
					fill="#000000"
					stroke="#ffffff"
					strokeWidth={strokeWidth}
					strokeLinejoin="round"
					strokeLinecap="round"
					paintOrder="stroke fill"
				>
					{text}
				</text>
			</svg>
		</span>
	);
}
