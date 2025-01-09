import Pagination from "@cloudscape-design/components/pagination";

import { HackerApplicantSummary } from "@/lib/admin/useHackerApplicants";

interface HackerPaginationProps {
	currentPageIndex: number;
	onChange: (newCurrentPageIndex: number) => void;
	applicantsList: HackerApplicantSummary[];
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
		></Pagination>
	);
}

export default HackerPagination;
