"use client";

import { useMemo, useState } from "react";
import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import Select, { SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table, { TableProps } from "@cloudscape-design/components/table";
import { useCollection } from "@cloudscape-design/collection-hooks";

import { Status, ParticipantRole } from "@/lib/userRecord";

import useApplicantTable, { type GroupBy } from "./useApplicantTable";

const roleOptions: SelectProps.Options = [
	{ label: "All Roles", value: "" },
	{ label: "Hacker", value: ParticipantRole.Hacker },
	{ label: "Mentor", value: ParticipantRole.Mentor },
	{ label: "Volunteer", value: ParticipantRole.Volunteer },
];

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
	{ label: "Queued", value: Status.Queued },
];

const pronounsOptions: SelectProps.Options = [
	{ label: "All Pronouns", value: "" },
	{ label: "He/him/his", value: "he" },
	{ label: "She/her/hers", value: "she" },
	{ label: "They/them/theirs", value: "they" },
	{ label: "Other", value: "other" },
];

const ethnicityOptions: SelectProps.Options = [
	{ label: "All Ethnicities", value: "" },
	{ label: "American Indian or Alaskan", value: "American" },
	{ label: "Asian or Pacific Islander", value: "Asian" },
	{ label: "Black or African American", value: "Black" },
	{ label: "Hispanic", value: "Hispanic" },
	{ label: "White or Caucasian", value: "White" },
	{ label: "Two or more races", value: "Two-or-more" },
	{ label: "Prefer not to answer", value: "Prefer not to answer" },
	{ label: "Other", value: "other" },
];

const categoryOptions: SelectProps.Options = [
	{ label: "School", value: "school" },
	{ label: "Major", value: "major" },
	{ label: "Year", value: "year" },
];

interface Row {
	answer: string;
	count: number;
}

const columns: TableProps.ColumnDefinition<Row>[] = [
	{
		id: "answer",
		header: "Category",
		cell: (item) => item.answer,
		sortingField: "answer",
	},
	{
		id: "count",
		header: "Number of responses",
		cell: (item) => item.count,
		sortingField: "count",
	},
];

function ApplicantTable() {
	const [selectedRole, setSelectedRole] = useState<SelectProps.Option | null>(
		null,
	);
	const [selectedStatus, setSelectedStatus] =
		useState<SelectProps.Option | null>(null);
	const [selectedPronouns, setSelectedPronouns] =
		useState<SelectProps.Option | null>(null);
	const [selectedEthnicity, setSelectedEthnicity] =
		useState<SelectProps.Option | null>(null);
	const [selectedCategory, setSelectedCategory] =
		useState<SelectProps.Option | null>(categoryOptions[0]);

	const { table, loading } = useApplicantTable({
		role: (selectedRole?.value as ParticipantRole) || null,
		status: (selectedStatus?.value as Status) || null,
		pronouns: selectedPronouns?.value || null,
		ethnicity: selectedEthnicity?.value || null,
		category: (selectedCategory?.value as GroupBy) || "school",
	});

	const allItems: Row[] = useMemo(() => {
		return Object.entries(table).map(([answer, count]) => ({
			answer,
			count,
		}));
	}, [table]);

	const { items, collectionProps } = useCollection(allItems, {
		sorting: {
			defaultState: {
				sortingColumn: columns[1],
				isDescending: true,
			},
		},
	});

	return (
		<Container header={<Box variant="h2">Applicant Table</Box>}>
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
					<Select
						selectedOption={selectedCategory}
						onChange={({ detail }) =>
							setSelectedCategory(detail.selectedOption)
						}
						options={categoryOptions}
						placeholder="Group by"
					/>
					<Select
						selectedOption={selectedPronouns}
						onChange={({ detail }) =>
							setSelectedPronouns(detail.selectedOption)
						}
						options={pronounsOptions}
						placeholder="Filter by pronoun"
					/>
					<Select
						selectedOption={selectedEthnicity}
						onChange={({ detail }) =>
							setSelectedEthnicity(detail.selectedOption)
						}
						options={ethnicityOptions}
						placeholder="Filter by ethnicity"
					/>
				</SpaceBetween>
				<Table
					{...collectionProps}
					columnDefinitions={columns}
					items={items}
					loading={loading}
					loadingText="Loading table"
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

export default ApplicantTable;
