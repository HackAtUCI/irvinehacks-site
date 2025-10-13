"use client";

export default function PixelArtDisplay({
	gridColors,
}: {
	gridColors: number[] | string;
}) {
	const parsedColors: number[] =
		typeof gridColors === "string" ? JSON.parse(gridColors) : gridColors || [];

	const colorPalette = [
		"#ffffff",
		"#fca5a5",
		"#fdba74",
		"#fde047",
		"#86efac",
		"#93c5fd",
		"#a5b4fc",
		"#c4b5fd",
		"#f9a8d4",
		"#9ca3af",
		"#f87171",
		"#fb923c",
		"#facc15",
		"#4ade80",
		"#60a5fa",
		"#818cf8",
		"#a78bfa",
		"#f472b6",
		"#374151",
		"#dc2626",
		"#ea580c",
		"#ca8a04",
		"#16a34a",
		"#2563eb",
		"#4f46e5",
		"#7c3aed",
		"#db2777",
	];

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(8, 20px)",
				gridTemplateRows: "repeat(8, 20px)",
				justifyContent: "center",
				marginTop: "10px",
				backgroundColor: "rgba(0, 0, 0, 0.83)",
				padding: "50px",
			}}
		>
			{parsedColors.map((colorIndex, i) => (
				<div
					key={i}
					style={{
						width: "25px",
						height: "25px",
						backgroundColor: colorPalette[colorIndex] || "#fff",
						border: "1px solid rgba(255, 255, 255, 0.08)",
					}}
				/>
			))}
		</div>
	);
}
