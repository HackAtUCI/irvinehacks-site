import { ReactElement, useCallback, useState } from "react";

import Checkbox from "@cloudscape-design/components/checkbox";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import Header from "@cloudscape-design/components/header";
import { MultiselectProps } from "@cloudscape-design/components/multiselect";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table, { TableProps } from "@cloudscape-design/components/table";
import Spinner from "@cloudscape-design/components/spinner";

import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";
import { Participant } from "@/lib/admin/useParticipants";
import { Decision, ParticipantRole } from "@/lib/userRecord";

import CheckinDayIcon from "./CheckinDayIcon";
import ParticipantAction from "./ParticipantAction";
import ParticipantsFilters from "./ParticipantsFilters";
import RoleBadge from "./RoleBadge";
import SearchScannerModal from "./SearchScannerModal";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

const FRIDAY = new Date("2026-02-27T12:00:00");
const SATURDAY = new Date("2026-02-28T12:00:00");
const SUNDAY = new Date("2026-03-01T12:00:00");

interface EmptyStateProps {
	title: string;
	subtitle?: string;
	action?: ReactElement;
}

interface ParticipantsTableProps {
	participants: Participant[];
	loading: boolean;
	initiateCheckIn: (participant: Participant) => void;
	initiateConfirm: (participant: Participant) => void;
	updateWaiverStatus: (participant: Participant, isSigned: boolean) => void;
}

export type Options = ReadonlyArray<MultiselectProps.Option>;
const SEARCHABLE_COLUMNS: (keyof Participant)[] = [
	"_id",
	"first_name",
	"last_name",
	"roles",
	"status",
	"decision",
];

type StrictColumnDefinition = TableProps.ColumnDefinition<Participant> & {
	id: string;
	header: string;
};

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
	initiateConfirm,
	updateWaiverStatus,
}: ParticipantsTableProps) {
	const [preferences, setPreferences] = useState({
		pageSize: 20,
		visibleContent: [
			"uid",
			"firstName",
			"lastName",
			"roles",
			"status",
			"decision",
			"waiver",
			"friday",
			"saturday",
			"sunday",
			"slack",
			"action",
		],
	});
	const [filterRole, setFilterRole] = useState<Options>([]);
	const [filterStatus, setFilterStatus] = useState<Options>([]);
	const [filterDecision, setFilterDecision] = useState<Options>([]);
	const matchesRole = (p: Participant) =>
		filterRole.length === 0 ||
		filterRole
			.map((r) => r.value)
			.some((role) => p.roles.includes(role as ParticipantRole));
	const matchesStatus = (p: Participant) =>
		filterStatus.length === 0 ||
		filterStatus.map((s) => s.value).includes(p.status);
	const matchesDecision = (p: Participant) =>
		filterDecision.length === 0 ||
		(p.decision && filterDecision.map((d) => d.value).includes(p.decision));

	const {
		items,
		actions,
		filteredItemsCount,
		collectionProps,
		filterProps,
		paginationProps,
	} = useCollection(participants, {
		filtering: {
			empty: <EmptyState title="No participants" />,
			noMatch: (
				<EmptyState
					title="No matches"
					action={
						<Button onClick={() => actions.setFiltering("")}>
							Clear filter
						</Button>
					}
				/>
			),
			filteringFunction: (item, filteringText) => {
				if (!matchesRole(item)) {
					return false;
				}
				if (!matchesStatus(item)) {
					return false;
				}
				if (!matchesDecision(item)) {
					return false;
				}
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
	});

	const allRoles = new Set(participants.flatMap((p) => p.roles));
	const roleOptions = Array.from(allRoles).map((r) => ({ value: r, label: r }));
	const allStatuses = new Set(participants.map((p) => p.status));
	const statusOptions = Array.from(allStatuses).map((s) => ({
		value: s,
		label: s,
	}));
	const allDecisions = new Set(
		participants.map((p) => p.decision).filter((d): d is Decision => !!d),
	);
	const decisionOptions = Array.from(allDecisions).map((d) => ({
		value: d,
		label: d,
	}));

	const ActionCell = useCallback(
		(participant: Participant) => (
			<ParticipantAction
				participant={participant}
				initiateCheckIn={initiateCheckIn}
				initiateConfirm={initiateConfirm}
			/>
		),
		[initiateCheckIn, initiateConfirm],
	);

	const [loadingWaivers, setLoadingWaivers] = useState<Set<string>>(new Set());

	const onWaiverChange = useCallback(
		async (item: Participant, checked: boolean) => {
			setLoadingWaivers((prev) => new Set(prev).add(item._id));
			try {
				await updateWaiverStatus(item, checked);
			} finally {
				setLoadingWaivers((prev) => {
					const next = new Set(prev);
					next.delete(item._id);
					return next;
				});
			}
		},
		[updateWaiverStatus],
	);

	const WaiverCell = useCallback(
		(item: Participant) => {
			const isLoading = loadingWaivers.has(item._id);
			return (
				<SpaceBetween direction="horizontal" size="xs">
					<Checkbox
						checked={!!item.is_waiver_signed}
						onChange={({ detail }) => onWaiverChange(item, detail.checked)}
						disabled={isLoading}
					/>
					{isLoading && <Spinner />}
				</SpaceBetween>
			);
		},
		[onWaiverChange, loadingWaivers],
	);

	const columnDefinitions: StrictColumnDefinition[] = [
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
			id: "roles",
			header: "Roles",
			cell: RoleBadge,
			ariaLabel: createLabelFunction("Roles"),
			sortingField: "roles",
		},
		{
			id: "status",
			header: "Status",
			cell: ApplicantStatus,
			ariaLabel: createLabelFunction("status"),
			sortingField: "status",
		},
		{
			id: "decision",
			header: "Decision",
			cell: DecisionCell,
			ariaLabel: createLabelFunction("decision"),
			sortingField: "decision",
		},
		{
			id: "waiver",
			header: "Waiver",
			cell: WaiverCell,
			sortingField: "is_waiver_signed",
		},
		{
			id: "slack",
			header: "Slack",
			cell: SlackCell,
			sortingField: "is_added_to_slack",
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
			minWidth: 108,
		},
	];

	const emptyMessage = (
		<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
			<SpaceBetween size="m">
				<b>No participants</b>
			</SpaceBetween>
		</Box>
	);

	const [showScanner, setShowScanner] = useState(false);

	const openScanner = () => {
		setShowScanner(true);
	};

	const cancelScanner = () => {
		setShowScanner(false);
	};

	const useScannerValue = (value: string) => {
		actions.setFiltering(value);
		setShowScanner(false);
	};

	return (
		<>
			<SearchScannerModal
				onDismiss={cancelScanner}
				onConfirm={useScannerValue}
				show={showScanner}
			/>
			<Table
				{...collectionProps}
				header={
					<Header
						counter={`(${participants.length})`}
						actions={<Button onClick={openScanner}>Scan Badge</Button>}
					>
						Participants
					</Header>
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
						decisions={decisionOptions}
						selectedDecisions={filterDecision}
						setSelectedDecisions={setFilterDecision}
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
						onConfirm={({ detail }) =>
							setPreferences(
								detail as { pageSize: number; visibleContent: Array<string> },
							)
						}
					/>
				}
			/>
		</>
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

const DecisionCell = (item: Participant) =>
	item.decision ? <ApplicantStatus status={item.decision} /> : "-";

const SlackCell = (item: Participant) => (
	<StatusIndicator type={item.is_added_to_slack ? "success" : "error"} />
);

export default ParticipantsTable;
