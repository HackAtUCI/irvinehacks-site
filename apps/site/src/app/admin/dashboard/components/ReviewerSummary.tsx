"use client";

import { useMemo, useState, useContext } from "react";
import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table, { TableProps } from "@cloudscape-design/components/table";
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
	const [minimumInput, setMinimumInput] = useState("");

	const minimum = minimumInput !== "" ? parseInt(minimumInput, 10) : null;
	const director = isDirector(roles);

	const allItems: Row[] = useMemo(() => {
		if (loading || applicantList.length === 0) return [];

		const reviewerCountMap = new Map<string, number>();
		for (const applicant of applicantList) {
			for (const id of applicant.reviewers || []) {
				reviewerCountMap.set(id, (reviewerCountMap.get(id) ?? 0) + 1);
			}
		}

		return Array.from(reviewerCountMap.entries()).map(([id, count]) => ({
			name: id.split(".")[2],
			count,
		}));
	}, [applicantList, loading]);

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
					loading={loading}
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
