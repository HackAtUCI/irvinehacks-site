export function createLabelFunction(columnName: string) {
	return ({ sorted, descending }: { sorted: boolean; descending: boolean }) => {
		const sortState = sorted
			? `sorted ${descending ? "descending" : "ascending"}`
			: "not sorted";
		return `${columnName}, ${sortState}.`;
	};
}
