import Pagination from "@cloudscape-design/components/pagination";

interface HackerPaginationProps {
	currentPageIndex: number;
	onChange: (newCurrentPageIndex: number) => void;
	numPages: number;
}

function HackerPagination({
	currentPageIndex,
	onChange,
	numPages,
}: HackerPaginationProps) {
	return (
		<Pagination
			currentPageIndex={currentPageIndex}
			onChange={({ detail }) => {
				onChange(detail.currentPageIndex);
			}}
			pagesCount={numPages}
		/>
	);
}

export default HackerPagination;
