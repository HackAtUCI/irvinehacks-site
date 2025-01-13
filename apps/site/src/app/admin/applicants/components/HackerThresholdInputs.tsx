import { useState } from "react";
import axios from "axios";

import {
	Box,
	Button,
	Input,
	SpaceBetween,
} from "@cloudscape-design/components";

import useHackerThresholds from "@/lib/admin/useHackerThresholds";

function HackerThresholdInputs() {
	const { thresholds } = useHackerThresholds();

	const [acceptValue, setAcceptValue] = useState("");
	const [waitlistValue, setWaitlistValue] = useState("");

	const [status, setStatus] = useState("");

	async function submitThresholds() {
		const sentAcceptValue = acceptValue ? parseFloat(acceptValue) : -1;
		const sentWaitlistValue = waitlistValue ? parseFloat(waitlistValue) : -1;

		if (isValidAccept() && isValidWaitlist()) {
			await axios
				.post("/api/admin/set-thresholds", {
					accept: sentAcceptValue,
					waitlist: sentWaitlistValue,
				})
				.then((response) => {
					// TODO: Add flashbar or modal to show post status
					if (response.status === 200) {
						setStatus(
							"Successfully updated thresholds. Reload to see changes to applicants.",
						);
					} else {
						setStatus("Failed to update thresholds");
					}
				});
		}
	}

	const isValidAccept = () => {
		if (!acceptValue || !waitlistValue) return true;

		const sentAcceptValue = parseFloat(acceptValue);
		const sentWaitlistValue = parseFloat(waitlistValue);

		if (sentAcceptValue < -1 || sentAcceptValue > 10) return false;

		if (sentAcceptValue < sentWaitlistValue) return false;

		return true;
	};

	const isValidWaitlist = () => {
		if (!acceptValue || !waitlistValue) return true;

		const sentAcceptValue = parseFloat(acceptValue);
		const sentWaitlistValue = parseFloat(waitlistValue);

		if (sentWaitlistValue < -1 || sentWaitlistValue > 10) return false;

		if (sentAcceptValue < sentWaitlistValue) return false;

		return true;
	};

	return (
		<SpaceBetween direction="vertical" size="xs">
			{thresholds && (
				<>
					<Box variant="awsui-key-label">
						Current Accept Threshold: {thresholds.accept}
					</Box>
					<Box variant="awsui-key-label">
						Current Waitlist Threshold: {thresholds.waitlist}
					</Box>
				</>
			)}
			<Box variant="awsui-key-label">Accept Threshold</Box>
			<Input
				onChange={({ detail }) => setAcceptValue(detail.value)}
				value={acceptValue}
				type="number"
				inputMode="decimal"
				placeholder="Accept Threshold"
				step={0.1}
				invalid={!isValidAccept()}
			/>
			<Box variant="awsui-key-label">Waitlist Threshold</Box>
			<Input
				onChange={({ detail }) => setWaitlistValue(detail.value)}
				value={waitlistValue}
				type="number"
				inputMode="decimal"
				placeholder="Waitlist Threshold"
				step={0.1}
				invalid={!isValidWaitlist()}
			/>
			<Box variant="p">
				Any score under{" "}
				{waitlistValue ? waitlistValue : "the waitlist threshold"} will be
				rejected
			</Box>
			<Button variant="primary" onClick={submitThresholds}>
				Update Thresholds
			</Button>
			{status ? (
				<Box variant="awsui-key-label" color="text-status-warning">
					{status}
				</Box>
			) : null}
		</SpaceBetween>
	);
}

export default HackerThresholdInputs;
