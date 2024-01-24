"use client";

import useParticipants from "@/lib/admin/useParticipants";

import ParticipantsTable from "./components/ParticipantsTable";

function Participants() {
	const { participants, loading } = useParticipants();

	return (
		<>
			<ParticipantsTable participants={participants} loading={loading} />;
			{/* TODO: modal */}
		</>
	);
}

export default Participants;
