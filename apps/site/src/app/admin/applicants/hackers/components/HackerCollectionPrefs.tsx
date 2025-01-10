import CollectionPreferences from "@cloudscape-design/components/collection-preferences";

interface HackerCollectionPrefs {
	pageSize: number;
	onChange: (newPageSize: number) => void;
	resetPageIndex: () => void;
}

function HackerCollectionPrefs({
	pageSize,
	onChange,
	resetPageIndex,
}: HackerCollectionPrefs) {
	return (
		<CollectionPreferences
			title="Preferences"
			confirmLabel="Confirm"
			cancelLabel="Cancel"
			onConfirm={({ detail }) => {
				onChange(detail.pageSize ?? 8);
				resetPageIndex();
				console.log(pageSize);
			}}
			preferences={{ pageSize }}
			pageSizePreference={{
				title: "Number of applicants per page",
				options: [
					{ value: 8, label: "8" },
					{ value: 16, label: "16" },
				],
			}}
		/>
	);
}

export default HackerCollectionPrefs;
