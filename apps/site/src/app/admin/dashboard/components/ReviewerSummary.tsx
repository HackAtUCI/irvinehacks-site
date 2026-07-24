"use client";

import { useMemo, useState, useContext } from "react";
import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table, { TableProps } from "@cloudscape-design/components/table";
import useOrganizers from "@/lib/admin/useOrganizers";
import { useCollection } from "@cloudscape-design/collection-hooks";

import { isDirector } from "@/lib/admin/authorization";
import UserContext from "@/lib/admin/UserContext";
import useHackerApplicants from "@/lib/admin/useHackerApplicants";

interface Row {
	name: string;
	count: number;
}

function buildColumns(
	minimum: number | null,
): TableProps.ColumnDefinition<Row>[] {
	const cols: TableProps.ColumnDefinition<Row>[] = [
		{
			id: "name",
			header: "Reviewer",
			cell: (item) => item.name,
			sortingField: "name",
		},
		{
			id: "count",
			header: "Applications Reviewed",
			cell: (item) => item.count,
			sortingField: "count",
		},
	];

	if (minimum !== null) {
		cols.push({
			id: "status",
			header: "Goal",
			cell: (item) =>
				item.count >= minimum ? (
					<StatusIndicator type="success">Met</StatusIndicator>
				) : (
					<StatusIndicator type="warning">
						{minimum - item.count} remaining
					</StatusIndicator>
				),
		});
	}

	return cols;
}

function ReviewerSummary() {
	const { roles } = useContext(UserContext);
	const { applicantList, loading } = useHackerApplicants();
	const { organizerList, loading: organizersLoading } = useOrganizers();
	const [minimumInput, setMinimumInput] = useState("");

	const minimum = minimumInput !== "" ? parseInt(minimumInput, 10) : null;
	const director = isDirector(roles);
	const combinedLoading = loading || organizersLoading;

	const allItems: Row[] = useMemo(() => {
		if (combinedLoading) return [];

		const nameMap = new Map<string, string>();
		for (const organizer of organizerList) {
			nameMap.set(
				organizer._id,
				`${organizer.first_name} ${organizer.last_name}`,
			);
		}

		const reviewerCountMap = new Map<string, number>();
		for (const organizer of organizerList) {
			reviewerCountMap.set(organizer._id, 0);
		}

		for (const applicant of applicantList) {
			for (const id of applicant.reviewers || []) {
				if (reviewerCountMap.has(id)) {
					reviewerCountMap.set(id, reviewerCountMap.get(id)! + 1);
				}
			}
		}

		return Array.from(reviewerCountMap.entries()).map(([id, count]) => ({
			name: nameMap.get(id) || id.split(".")[2],
			count,
		}));
	}, [applicantList, combinedLoading, organizerList]);

	const columns = useMemo(() => buildColumns(minimum), [minimum]);

	const { items, collectionProps } = useCollection(allItems, {
		sorting: {
			defaultState: {
				sortingColumn: columns[1],
				isDescending: true,
			},
		},
	});

	return (
		<Container header={<Box variant="h2">Reviewer Summary</Box>}>
			<SpaceBetween size="m">
				{director && (
					<FormField label="Minimum reviews per organizer">
						<div style={{ maxWidth: 250 }}>
							<Input
								type="number"
								value={minimumInput}
								onChange={({ detail }) => setMinimumInput(detail.value)}
								placeholder="Set a goal (ex: 10, 50...)"
							/>
						</div>
					</FormField>
				)}
				<Table
					{...collectionProps}
					columnDefinitions={columns}
					items={items}
					loading={combinedLoading}
					loadingText="Loading reviewers"
					enableKeyboardNavigation
					stripedRows
					stickyHeader
					empty={
						<Box textAlign="center" color="inherit">
							<b>No data available</b>
						</Box>
					}
				/>
			</SpaceBetween>
		</Container>
	);
}

export default ReviewerSummary;
