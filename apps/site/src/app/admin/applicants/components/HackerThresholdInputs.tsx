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
		const sentAcceptValue = acceptValue ? parseFloat(acceptValue) : null;
		const sentWaitlistValue = waitlistValue ? parseFloat(waitlistValue) : null;

		if (isValidAccept() && isValidWaitlist()) {
			await axios
				.post("/api/director/set-thresholds", {
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
		if (!acceptValue) return true;

		const sentAcceptValue = parseFloat(acceptValue);

		if (!thresholds) {
			if (!waitlistValue) return true;

			const sentWaitlistValue = parseFloat(waitlistValue);

			if (
				sentAcceptValue < sentWaitlistValue ||
				sentAcceptValue < -10 ||
				sentAcceptValue > 10
			)
				return false;

			return true;
		}

		const sentWaitlistValue = waitlistValue
			? parseFloat(waitlistValue)
			: thresholds.waitlist;

		if (
			sentAcceptValue < -10 ||
			sentAcceptValue > 10 ||
			sentAcceptValue < sentWaitlistValue
		)
			return false;

		return true;
	};

	const isValidWaitlist = () => {
		if (!waitlistValue) return true;

		const sentWaitlistValue = parseFloat(waitlistValue);

		if (!thresholds) {
			if (!acceptValue) return true;

			const sentAcceptValue = parseFloat(acceptValue);

			if (
				sentAcceptValue < sentWaitlistValue ||
				sentWaitlistValue < -10 ||
				sentWaitlistValue > 10
			)
				return false;

			return true;
		}

		const sentAcceptValue = acceptValue
			? parseFloat(acceptValue)
			: thresholds.accept;

		if (
			sentWaitlistValue < -10 ||
			sentWaitlistValue > 10 ||
			sentAcceptValue < sentWaitlistValue
		)
			return false;

		return true;
	};

	return (
		<SpaceBetween direction="vertical" size="xs">
			{thresholds && (
				<>
					<Box variant="awsui-key-label">
						Current Normalized Accept Threshold: {thresholds.accept}
					</Box>
					<Box variant="awsui-key-label">
						Current Normalized Waitlist Threshold: {thresholds.waitlist}
					</Box>
				</>
			)}
			<Box variant="awsui-key-label">Normalized Accept Threshold</Box>
			<Input
				onChange={({ detail }) => setAcceptValue(detail.value)}
				value={acceptValue}
				type="number"
				inputMode="decimal"
				placeholder="Normalized Accept Threshold"
				step={0.01}
				invalid={!isValidAccept()}
			/>
			<Box variant="awsui-key-label">Normalized Waitlist Threshold</Box>
			<Input
				onChange={({ detail }) => setWaitlistValue(detail.value)}
				value={waitlistValue}
				type="number"
				inputMode="decimal"
				placeholder="Normalized Waitlist Threshold"
				step={0.01}
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
