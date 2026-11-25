import Link from "@cloudscape-design/components/link";

import { getHackathonMode } from "@/app/admin/layout/common";

interface ApplicantNameLinkProps {
	id: string;
	name: string;
}

function ApplicantNameLink({ id, name }: ApplicantNameLinkProps) {
	const applicantType =
		getHackathonMode() === "zothacks" ? "zothacks-hackers" : "hackers";

	return (
		<Link href={`/admin/applicants/${applicantType}/${id}`} target="_blank">
			{name}
		</Link>
	);
}

export default ApplicantNameLink;
