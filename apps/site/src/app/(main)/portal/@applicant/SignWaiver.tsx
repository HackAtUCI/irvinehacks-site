import Button from "@/lib/components/Button/Button";

import { PortalStatus } from "./ApplicantPortal";

interface SignWaiverProps {
	status: string;
}

function SignWaiver({ status }: SignWaiverProps) {
	return status === PortalStatus.waived ? null : (
		<div>
			<hr />
			<p>
				In order to attend IrvineHacks 2024, please fill out the waiver below
			</p>
			<Button
				text="Sign Waiver to attend IrvineHacks 2024"
				href="/api/dev/waiver"
			/>
		</div>
	);
}

export default SignWaiver;
