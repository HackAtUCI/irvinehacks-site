import Button from "@/lib/components/Button/Button";

import { PortalStatus } from "./ApplicantPortal";

interface SignWaiverProps {
	status: PortalStatus;
}

function SignWaiver({ status }: SignWaiverProps) {
	return status === PortalStatus.waived ? null : (
		<div>
			<hr />
			<h3 className="text-3xl my-4">Waiver</h3>
			<p className="mt-4">
				In order to attend IrvineHacks 2024, please fill out the waiver below
			</p>
			<Button
				text="Sign Waiver to attend IrvineHacks 2024"
				href="/api/user/waiver"
			/>
		</div>
	);
}

export default SignWaiver;
