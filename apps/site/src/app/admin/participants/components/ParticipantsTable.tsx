import { useCallback } from "react";

import Box from "@cloudscape-design/components/box";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";

import ApplicantStatus from "@/app/admin/applicants/components/ApplicantStatus";
import { Participant } from "@/lib/admin/useParticipants";

import CheckinDayIcon from "./CheckinDayIcon";
import ParticipantAction from "./ParticipantAction";
import RoleBadge from "./RoleBadge";

const FRIDAY = new Date("2024-01-26T12:00:00");
const SATURDAY = new Date("2024-01-27T12:00:00");
const SUNDAY = new Date("2024-01-28T12:00:00");

interface ParticipantsTableProps {
	participants: Participant[];
	loading: boolean;
	initiateCheckIn: (participant: Participant) => void;
	initiatePromotion: (participant: Participant) => void;
}

function ParticipantsTable({
	participants,
	loading,
	initiateCheckIn,
	initiatePromotion,
}: ParticipantsTableProps) {
	// TODO: sorting
	// TODO: search functionality
	// TODO: role and status filters

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
			]}
			header={
				<Header counter={`(${participants.length})`}>Participants</Header>
			}
			items={participants}
			loading={loading}
			loadingText="Loading participants"
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
