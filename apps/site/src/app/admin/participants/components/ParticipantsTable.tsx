import { ReactElement, useCallback, useState } from "react";
import { useCollection } from "@cloudscape-design/collection-hooks";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import Header from "@cloudscape-design/components/header";
import { MultiselectProps } from "@cloudscape-design/components/multiselect";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";

import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";
import { Participant } from "@/lib/admin/useParticipants";

import CheckinDayIcon from "./CheckinDayIcon";
import ParticipantAction from "./ParticipantAction";
import ParticipantsFilters from "./ParticipantsFilters";
import RoleBadge from "./RoleBadge";

const FRIDAY = new Date("2024-01-26T12:00:00");
const SATURDAY = new Date("2024-01-27T12:00:00");
const SUNDAY = new Date("2024-01-28T12:00:00");

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

export type Options = ReadonlyArray<MultiselectProps.Option>;
const SEARCHABLE_COLUMNS: (keyof Participant)[] = [
	"_id",
	"first_name",
	"last_name",
	"role",
	"status",
];

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
	const [filterRole, setFilterRole] = useState<Options>([]);
	const [filterStatus, setFilterStatus] = useState<Options>([]);
	const matchesRole = (p: Participant) => filterRole.length === 0 || filterRole.map(r => r.value).includes(p.role);
	const matchesStatus = (p: Participant) => filterStatus.length === 0 || filterStatus.map(s => s.value).includes(p.status);

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

					return (
						SEARCHABLE_COLUMNS.map((key) => item[key]).some(
							(value) =>
								typeof value === "string" &&
								value.toLowerCase().includes(filteringTextLC),
						) ||
						`${item.first_name} ${item.last_name}`
							.toLowerCase()
							.includes(filteringTextLC)
					);
				},
			},
			pagination: { pageSize: preferences.pageSize },
			sorting: {},
			selection: {},
		}
	);
	const allRoles = new Set(participants.map(p => p.role));
	const roleOptions = Array.from(allRoles).map(r => ({ value: r, label: r }));
	const allStatuses = new Set(participants.map(p => p.status));
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
			id: "friday",
			header: "Fri",
			cell: FridayCheckin,
			sortingField: "friday",
		},
		{
			id: "saturday",
			header: "Sat",
			cell: SaturdayCheckin,
			sortingField: "saturday",
		},
		{
			id: "sunday",
			header: "Sun",
			cell: SundayCheckin,
			sortingField: "sunday",
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
			variant="full-page"
			stickyColumns={{ first: 1, last: 0 }}
			trackBy="_id"
			empty={emptyMessage}
			filter={
				<ParticipantsFilters
					filteredItemsCount={filteredItemsCount}
					filterProps={filterProps}
					roles={roleOptions}
					selectedRoles={filterRole}
					setSelectedRoles={setFilterRole}
					statuses={statusOptions}
					selectedStatuses={filterStatus}
					setSelectedStatuses={setFilterStatus}
				/>
			}
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

const FridayCheckin = ({ checkins }: Participant) => (
	<CheckinDayIcon checkins={checkins} date={FRIDAY} />
);

const SaturdayCheckin = ({ checkins }: Participant) => (
	<CheckinDayIcon checkins={checkins} date={SATURDAY} />
);

const SundayCheckin = ({ checkins }: Participant) => (
	<CheckinDayIcon checkins={checkins} date={SUNDAY} />
);

export default ParticipantsTable;
