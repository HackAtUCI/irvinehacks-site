import { useCallback } from "react";

import Box from "@cloudscape-design/components/box";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";

import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";
import { Participant } from "@/lib/admin/useParticipants";

import ParticipantAction from "./ParticipantAction";
import RoleBadge from "./RoleBadge";

interface ParticipantsTableProps {
	participants: Participant[];
	loading: boolean;
	initiateCheckIn: (participant: Participant) => void;
}

function ParticipantsTable({
	participants,
	loading,
	initiateCheckIn,
}: ParticipantsTableProps) {
	// TODO: sorting
	// TODO: search functionality
	// TODO: role and status filters

	const ActionCell = useCallback(
		(participant: Participant) => (
			<ParticipantAction
				participant={participant}
				initiateCheckIn={initiateCheckIn}
			/>
		),
		[initiateCheckIn],
	);

	const emptyMessage = (
		<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
			<SpaceBetween size="m">
				<b>No participants</b>
			</SpaceBetween>
		</Box>
	);

	return (
		<Table
			// TODO: aria labels
			columnDefinitions={[
				{
					id: "uid",
					header: "UID",
					cell: (item) => item._id,
					sortingField: "uid",
					isRowHeader: true,
				},
				{
					id: "firstName",
					header: "First name",
					cell: (item) => item.first_name,
					sortingField: "firstName",
				},
				{
					id: "lastName",
					header: "Last name",
					cell: (item) => item.last_name,
					sortingField: "lastName",
				},
				{
					id: "role",
					header: "Role",
					cell: RoleBadge,
					sortingField: "role",
				},
				{
					id: "status",
					header: "Status",
					cell: ApplicantStatus,
					sortingField: "status",
				},
				{
					id: "action",
					header: "Action",
					cell: ActionCell,
				},
			]}
			header={
				<Header counter={`(${participants.length})`}>Participants</Header>
			}
			items={participants}
			loading={loading}
			loadingText="Loading participants"
			resizableColumns
			variant="full-page"
			stickyColumns={{ first: 1, last: 0 }}
			trackBy="_id"
			empty={emptyMessage}
			filter={
				<TextFilter filteringPlaceholder="Find participants" filteringText="" />
			}
			// TODO: pagination
			// TODO: collection preferences
		/>
	);
}

export default ParticipantsTable;
