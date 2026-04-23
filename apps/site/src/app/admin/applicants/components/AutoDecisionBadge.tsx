import Badge from "@cloudscape-design/components/badge";

import { Decision } from "@/lib/userRecord";

const REASON_LABELS: Record<string, string> = {
	UNDER_18: "Under 18",
	GRADUATED: "Graduated",
};

interface AutoDecisionBadgeProps {
	reason: string | null | undefined;
	decision: Decision | null | undefined;
}

function AutoDecisionBadge({ reason, decision }: AutoDecisionBadgeProps) {
	if (!reason) return null;

	const color = decision === Decision.Accepted ? "green" : "red";
	const label = REASON_LABELS[reason] ?? reason;

	return <Badge color={color}>{label}</Badge>;
}

export default AutoDecisionBadge;
