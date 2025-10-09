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
		"#f28b82",
		"#fbbc04",
		"#fff475",
		"#ccff90",
		"#a7ffeb",
		"#cbf0f8",
		"#aecbfa",
		"#d7aefb",
		"#fdcfe8",
		"#e6c9a8",
		"#e8eaed",
		"#d50000",
		"#c51162",
		"#aa00ff",
		"#304ffe",
		"#2962ff",
		"#0091ea",
		"#00b8d4",
		"#00c853",
		"#64dd17",
		"#aeea00",
		"#ffd600",
		"#ffab00",
		"#ff6d00",
		"#dd2c00",
		"#8d6e63",
		"#9e9e9e",
	];

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(8, 20px)",
				gridTemplateRows: "repeat(8, 20px)",
				gap: "2px",
				justifyContent: "center",
				marginTop: "10px",
			}}
		>
			{parsedColors.map((colorIndex, i) => (
				<div
					key={i}
					style={{
						width: "20px",
						height: "20px",
						backgroundColor: colorPalette[colorIndex] || "#fff",
						border: "1px solid #ccc",
						borderRadius: "2px",
					}}
				/>
			))}
		</div>
	);
}
