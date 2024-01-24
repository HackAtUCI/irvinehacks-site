import Badge from "@cloudscape-design/components/badge";

import { Participant } from "@/lib/admin/useParticipants";

function RoleBadge({ role }: Participant) {
	// TODO: custom colors
	return <Badge>{role}</Badge>;
}

export default RoleBadge;
