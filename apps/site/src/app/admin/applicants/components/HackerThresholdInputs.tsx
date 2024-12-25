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
		await axios
			.post("/api/admin/set-thresholds", {
				accept: acceptValue,
				waitlist: waitlistValue,
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
			/>
			<Box variant="awsui-key-label">Waitlist Threshold</Box>
			<Input
				onChange={({ detail }) => setWaitlistValue(detail.value)}
				value={waitlistValue}
				type="number"
				inputMode="decimal"
				placeholder="Waitlist Threshold"
				step={0.1}
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
