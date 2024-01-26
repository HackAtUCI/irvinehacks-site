import { ReactElement, useCallback, useState } from "react";
import { useCollection } from "@cloudscape-design/collection-hooks";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";

import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";
import { Participant } from "@/lib/admin/useParticipants";

import ParticipantAction from "./ParticipantAction";
import RoleBadge from "./RoleBadge";

interface EmptyStateProps {
	title: string;
	subtitle?: string;
	action?: ReactElement;
}

interface ParticipantsTableProps {
	participants: Participant[];
	loading: boolean;
	initiateCheckIn: (participant: Participant) => void;
	initiatePromotion: (participant: Participant) => void;
}

const ALL_ROLES = { value: "0", label: "All roles" };
const ALL_STATUSES = { value: "0", label: "All roles" };
const SEARCHABLE_COLUMNS = ["_id", "first_name", "last_name", "role", "status"];

function createLabelFunction(columnName: string) {
	return ({ sorted, descending }: { sorted: boolean; descending: boolean }) => {
		const sortState = sorted
			? `sorted ${descending ? "descending" : "ascending"}`
			: "not sorted";
		return `${columnName}, ${sortState}.`;
	};
}

function EmptyState({ title, subtitle, action }: EmptyStateProps) {
	return (
		<Box textAlign="center" color="inherit">
			<Box variant="strong" textAlign="center" color="inherit">
				{title}
			</Box>
			<Box variant="p" padding={{ bottom: "s" }} color="inherit">
				{subtitle}
			</Box>
			{action}
		</Box>
	);
}

function ParticipantsTable({
	participants,
	loading,
	initiateCheckIn,
	initiatePromotion,
}: ParticipantsTableProps) {
	const [preferences, setPreferences] = useState({
		pageSize: 20,
		visibleContent: [
			"uid",
			"firstName",
			"lastName",
			"role",
			"status",
			"action",
		],
	});
	const [filterRole, setFilterRole] = useState(ALL_ROLES);
	const [filterStatus, setFilterStatus] = useState(ALL_STATUSES);
	const matchesRole = (p: Participant) => filterRole === ALL_ROLES || p.role === filterRole.label;
	const matchesStatus = (p: Participant) => filterStatus === ALL_STATUSES || p.status === filterStatus.label;

	const {
		items,
		actions,
		filteredItemsCount,
		collectionProps,
		filterProps,
		paginationProps,
	} = useCollection(
		participants,
		{
			filtering: {
				empty: <EmptyState title="No participants" />,
				noMatch: (
					<EmptyState
						title="No matches"
						action={<Button onClick={() => actions.setFiltering('')}>Clear filter</Button>}
					/>
				),
				filteringFunction: (item, filteringText) => {
					if (!matchesRole(item)) { return false; }
					if (!matchesStatus(item)) { return false; }
					const filteringTextLC = filteringText.toLowerCase();

					return SEARCHABLE_COLUMNS.map(key => item[key]).some(
						value => typeof value === 'string' && value.toLowerCase().indexOf(filteringTextLC) > -1
					)
				},
			},
			pagination: { pageSize: preferences.pageSize },
			sorting: {},
			selection: {},
		}
	);
	const allRoles = new Set(items.map(p => p.role));
	const roleOptions = Array.from(allRoles).map(r => ({ value: r, label: r }));
	const allStatuses = new Set(items.map(p => p.status));
	const statusOptions = Array.from(allStatuses).map(s => ({ value: s, label: s }));

	const ActionCell = useCallback(
		(participant: Participant) => (
			<ParticipantAction
				participant={participant}
				initiateCheckIn={initiateCheckIn}
				initiatePromotion={initiatePromotion}
			/>
		),
		[initiateCheckIn, initiatePromotion],
	);

	const columnDefinitions = [
		{
			id: "uid",
			header: "UID",
			cell: (item: Participant) => item._id,
			ariaLabel: createLabelFunction("UID"),
			sortingField: "_id",
			isRowHeader: true,
		},
		{
			id: "firstName",
			header: "First name",
			cell: (item: Participant) => item.first_name,
			ariaLabel: createLabelFunction("First name"),
			sortingField: "first_name",
		},
		{
			id: "lastName",
			header: "Last name",
			cell: (item: Participant) => item.last_name,
			ariaLabel: createLabelFunction("Last name"),
			sortingField: "last_name",
		},
		{
			id: "role",
			header: "Role",
			cell: RoleBadge,
			ariaLabel: createLabelFunction("Role"),
			sortingField: "role",
		},
		{
			id: "status",
			header: "Status",
			cell: ApplicantStatus,
			ariaLabel: createLabelFunction("status"),
			sortingField: "status",
		},
		{
			id: "action",
			header: "Action",
			cell: ActionCell,
		},
	];

	const emptyMessage = (
		<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
			<SpaceBetween size="m">
				<b>No participants</b>
			</SpaceBetween>
		</Box>
	);

	return (
		<Table
			{...collectionProps}
			header={
				<Header counter={`(${participants.length})`}>Participants</Header>
			}
			columnDefinitions={columnDefinitions}
			visibleColumns={preferences.visibleContent}
			items={items}
			loading={loading}
			loadingText="Loading participants"
			resizableColumns
			variant="full-page"
			stickyColumns={{ first: 1, last: 0 }}
			trackBy="_id"
			empty={emptyMessage}
			filter={(
				<>
					<TextFilter
						{...filterProps}
						countText={filteredItemsCount === 1 ? '1 participant' : `${filteredItemsCount} participants`}
						filteringAriaLabel="Filter participants"
					/>
					<FormField label="Role">
						<Select
							data-testid="role-filter"
							options={[ALL_ROLES].concat(roleOptions)}
							selectedAriaLabel="Selected"
							selectedOption={filterRole}
							onChange={event => setFilterRole(event.detail.selectedOption as { value: string, label: string })}
							expandToViewport={true}
						/>
					</FormField>
					<FormField label="Status">
						<Select
							data-testid="status-filter"
							options={[ALL_STATUSES].concat(statusOptions)}
							selectedAriaLabel="Selected"
							selectedOption={filterStatus}
							onChange={event => setFilterStatus(event.detail.selectedOption as { value: string, label: string })}
							expandToViewport={true}
						/>
					</FormField>
				</>
			)}
			pagination={
				<Pagination
					{...paginationProps}
					ariaLabels={{
						nextPageLabel: "Next page",
						pageLabel: (pageNumber) => `Go to page ${pageNumber}`,
						previousPageLabel: "Previous page",
					}}
				/>
			}
			preferences={
				<CollectionPreferences
					pageSizePreference={{
						title: "Select page size",
						options: [
							{ value: 20, label: "20 people" },
							{ value: 50, label: "50 people" },
							{ value: 100, label: "100 people" },
						],
					}}
					visibleContentPreference={{
						title: "Select visible columns",
						options: [
							{
								label: "Participant info",
								options: columnDefinitions.map(({ id, header }) => ({
									id,
									label: header,
								})),
							},
						],
					}}
					cancelLabel="Cancel"
					confirmLabel="Confirm"
					title="Preferences"
					preferences={preferences}
					onConfirm={({ detail }) => setPreferences(detail as { pageSize: number, visibleContent: Array<string> })}
				/>
			}
		/>
	);
}

export default ParticipantsTable;
