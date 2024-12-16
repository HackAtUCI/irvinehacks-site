import Badge from "@cloudscape-design/components/badge";

import { Participant } from "@/lib/admin/useParticipants";
import { SpaceBetween } from "@cloudscape-design/components";

function RoleBadge({ roles }: Participant) {
	// TODO: custom colors
	return (
		<SpaceBetween size="xs">
			{roles.map((role) => (
				<Badge key={role}>{role}</Badge>
			))}
		</SpaceBetween>
	);
}

export default RoleBadge;
