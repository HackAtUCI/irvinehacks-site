"use client";

import { useState } from "react";
import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import PieChart from "@cloudscape-design/components/pie-chart";
import Select, { SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";

import { Status, ParticipantRole } from "@/lib/userRecord";

import useApplicantSummary from "./useApplicantSummary";

// Role options for the dropdown
const roleOptions: SelectProps.Options = [
	{ label: "All Roles", value: "" },
	{ label: "Hacker", value: ParticipantRole.Hacker },
	{ label: "Mentor", value: ParticipantRole.Mentor },
	{ label: "Volunteer", value: ParticipantRole.Volunteer },
	{ label: "Sponsor", value: ParticipantRole.Sponsor },
	{ label: "Judge", value: ParticipantRole.Judge },
	{ label: "Workshop Lead", value: ParticipantRole.WorkshopLead },
];

// Status options for the dropdown
const statusOptions: SelectProps.Options = [
	{ label: "All Statuses", value: "" },
	{ label: "Pending Review", value: Status.Pending },
	{ label: "Reviewed", value: Status.Reviewed },
	{ label: "Accepted", value: Status.Accepted },
	{ label: "Rejected", value: Status.Rejected },
	{ label: "Waitlisted", value: Status.Waitlisted },
	{ label: "Waiver Signed", value: Status.Signed },
	{ label: "Confirmed", value: Status.Confirmed },
	{ label: "Attending", value: Status.Attending },
	{ label: "Void", value: Status.Void },
];

function ApplicantSummary() {
	const [selectedRole, setSelectedRole] = useState<SelectProps.Option | null>(
		null,
	);
	const [selectedStatus, setSelectedStatus] =
		useState<SelectProps.Option | null>(null);

	const { summary, loading, error } = useApplicantSummary({
		role: (selectedRole?.value as ParticipantRole) || null,
		status: (selectedStatus?.value as Status) || null,
	});
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
			<SpaceBetween size="l">
				<SpaceBetween direction="horizontal" size="m">
					<Select
						selectedOption={selectedRole}
						onChange={({ detail }) => setSelectedRole(detail.selectedOption)}
						options={roleOptions}
						placeholder="Filter by role"
					/>
					<Select
						selectedOption={selectedStatus}
						onChange={({ detail }) => setSelectedStatus(detail.selectedOption)}
						options={statusOptions}
						placeholder="Filter by status"
					/>
				</SpaceBetween>
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
			</SpaceBetween>
		</Container>
	);
}

const percentage = (value: number): string => (value * 100).toFixed(0);

export default ApplicantSummary;
