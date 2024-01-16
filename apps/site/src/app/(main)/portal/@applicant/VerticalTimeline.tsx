import Image from "next/image";

import BorderCircle from "@/assets/icons/border-circle.svg";
import CheckCircle from "@/assets/icons/check-circle-fill.svg";
import XCircle from "@/assets/icons/x-circle-fill.svg";

import { PortalStatus } from "./ApplicantPortal";

interface VerticalTimelineProps {
	status: PortalStatus;
}

function VerticalTimeline({ status }: VerticalTimelineProps) {
	const submission_component = (
		<li className="flex flex-row items-center">
			<Image
				src={CheckCircle}
				alt="checked-circle"
				width={25}
				height={25}
				className="m-6 mr-12"
			/>
			Application submitted
		</li>
	);

	const verdict_component =
		status === PortalStatus.accepted ||
		status === PortalStatus.waived ||
		status === PortalStatus.confirmed ? (
			<li className="flex flex-row items-center border-t">
				<Image
					src={CheckCircle}
					alt="checked-circle"
					width={25}
					height={25}
					className="m-6 mr-12"
				/>
				Application accepted
			</li>
		) : status === PortalStatus.rejected ? (
			<li className="flex flex-row items-center border-t">
				<Image
					src={XCircle}
					alt="checked-circle"
					width={25}
					height={25}
					className="m-6 mr-12"
				/>
				Application rejected
			</li>
		) : null;

	const waiver_component =
		status === PortalStatus.accepted ? (
			<li className="flex flex-row items-center border-t">
				<Image
					src={BorderCircle}
					alt="border-circle"
					width={25}
					height={25}
					className="m-6 mr-12"
				/>
				Sign waiver
			</li>
		) : status === PortalStatus.waived || status === PortalStatus.confirmed ? (
			<li className="flex flex-row items-center border-t">
				<Image
					src={CheckCircle}
					alt="checked-circle"
					width={25}
					height={25}
					className="m-6 mr-12"
				/>
				Waiver signed
			</li>
		) : null;

	const rsvp_component =
		status === PortalStatus.accepted ? (
			<li className="flex flex-row items-center border-t">
				<Image
					src={BorderCircle}
					alt="border-circle"
					width={25}
					height={25}
					className="m-6 mr-12"
				/>
				Confirm attendance
			</li>
		) : status === PortalStatus.confirmed ? (
			<li className="flex flex-row items-center border-t">
				<Image
					src={CheckCircle}
					alt="checked-circle"
					width={25}
					height={25}
					className="m-6 mr-12"
				/>
				Attendance confirmed
			</li>
		) : null;

	return (
		<div className="p-3">
			<ul className="border rounded-lg">
				{submission_component}
				{verdict_component}
				{waiver_component}
				{rsvp_component}
			</ul>
		</div>
	);
}

export default VerticalTimeline;
