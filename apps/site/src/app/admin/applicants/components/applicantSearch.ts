export function matchesSearch(
	applicant: { _id: string; first_name: string; last_name: string },
	searchText: string,
): boolean {
	const tokens = searchText.trim().toLowerCase().split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return true;

	const haystack = [
		applicant.first_name,
		applicant.last_name,
		`${applicant.first_name} ${applicant.last_name}`,
		applicant._id,
	]
		.join(" ")
		.toLowerCase();

	// every token must appear, so "jane doe" and "doe jane" both match
	return tokens.every((token) => haystack.includes(token));
}
