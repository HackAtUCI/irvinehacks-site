import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import PieChart from "@cloudscape-design/components/pie-chart";

import { Status } from "@/lib/userRecord";

import useApplicantSummary from "./useApplicantSummary";

function ApplicantSummary() {
	const { summary, loading, error } = useApplicantSummary();
	const totalApplicants = Object.values(summary).reduce((s, v) => s + v, 0);

	const orderedData = [
		Status.Pending,
		Status.Reviewed,
		Status.Rejected,
		Status.Waitlisted,
		Status.Accepted,
		Status.Signed,
		Status.Confirmed,
		Status.Attending,
		Status.Void,
	].map((status) => ({
		title: status,
		value: summary[status] ?? 0,
	}));

	return (
		<Container header={<Box variant="h2">Applicant Summary</Box>}>
			<PieChart
				data={orderedData}
				statusType={(loading && "loading") || (error && "error")}
				loadingText="Loading chart"
				hideFilter={true}
				segmentDescription={(datum, sum) =>
					`${datum.value} applicants (${percentage(datum.value / sum)}%)`
				}
				ariaDescription="Donut chart showing summary of applicant statuses."
				ariaLabel="Donut chart"
				innerMetricDescription="total applicants"
				innerMetricValue={`${totalApplicants}`}
				size="large"
				variant="donut"
				empty={
					<Box textAlign="center" color="inherit">
						<b>No data available</b>
						<Box variant="p" color="inherit">
							There is no data available
						</Box>
					</Box>
				}
			/>
		</Container>
	);
}

const percentage = (value: number): string => (value * 100).toFixed(0);

export default ApplicantSummary;
