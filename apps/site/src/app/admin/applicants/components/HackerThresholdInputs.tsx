import {
	Box,
	Button,
	Input,
	SpaceBetween,
} from "@cloudscape-design/components";
import axios from "axios";
import { useState } from "react";

function HackerThresholdInputs() {
	const [acceptValue, setAcceptValue] = useState("");
	const [waitlistValue, setWaitlistValue] = useState("");

	const [status, setStatus] = useState("");

	async function submitThresholds() {
		await axios
			.post("/api/admin/setThresholds", {
				accept: acceptValue,
				waitlist: waitlistValue
			})
			.then((response) => {
                // TODO: Add flashbar or modal
				if (response.status === 200) {
					setStatus("Successfully updated thresholds.");
				} else {
					setStatus("Failed to update thresholds");
				}
			});
	}

	return (
		<SpaceBetween direction="vertical" size="xs">
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
			<Box variant="p">Any score under {waitlistValue} will be rejected</Box>
			<Button variant="primary" onClick={submitThresholds}>
				Update Thresholds
			</Button>
			{status ? <Box variant="awsui-key-label">{status}</Box> : null}
		</SpaceBetween>
	);
}

export default HackerThresholdInputs;
