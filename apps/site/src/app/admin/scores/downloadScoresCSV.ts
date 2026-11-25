import { ScoreRow, formatScore } from "./scoreRows";

const HEADERS = [
	"Name",
	"Email",
	"Major",
	"LinkedIn",
	"Resume URL",
	"Average Normalized Score",
	"Comments",
];

function escapeCSV(val: string) {
	if (val.includes(",") || val.includes('"') || val.includes("\n")) {
		return `"${val.replace(/"/g, '""')}"`;
	}
	return val;
}

function downloadScoresCSV(rows: ReadonlyArray<ScoreRow>) {
	const lines = rows.map((row) => {
		const comments = row.reviews
			.map((r) => (r[3] ? `${r[1]}: ${r[3]}` : ""))
			.filter(Boolean)
			.map((c) => c.replace(/[\r\n]+/g, " | "))
			.join("; ");

		return [
			row.name,
			row.email,
			row.major,
			row.linkedin ?? "",
			row.resumeUrl ?? "",
			row.specialScoreLabel ?? formatScore(row.normalizedScore),
			comments,
		]
			.map(escapeCSV)
			.join(",");
	});

	const csvContent = [HEADERS.join(","), ...lines].join("\n");
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", "applicants.csv");
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export default downloadScoresCSV;
