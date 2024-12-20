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
	const [rejectValue, setRejectValue] = useState("");

	async function submitThresholds() {
		const res = await axios.post("/api/admin/setThresholds", {
			accept: acceptValue,
			waitlist: waitlistValue,
			reject: rejectValue,
		});
		console.log(res);
	}

	return (
		<SpaceBetween direction="vertical" size="xs">
			<Box variant="awsui-key-label">Accept Threshold</Box>
			<Input
				onChange={({ detail }) => setAcceptValue(detail.value)}
				value={acceptValue}
				type="number"
				inputMode="decimal"
				placeholder="Applicant score"
				step={0.1}
			/>
			<Box variant="awsui-key-label">Waitlist Threshold</Box>
			<Input
				onChange={({ detail }) => setWaitlistValue(detail.value)}
				value={waitlistValue}
				type="number"
				inputMode="decimal"
				placeholder="Applicant score"
				step={0.1}
			/>
			<Box variant="awsui-key-label">Reject Threshold</Box>
			<Input
				onChange={({ detail }) => setRejectValue(detail.value)}
				value={rejectValue}
				type="number"
				inputMode="decimal"
				placeholder="Applicant score"
				step={0.1}
			/>
			<Button variant="primary" onClick={submitThresholds}>
				Update Thresholds
			</Button>
		</SpaceBetween>
	);
}

export default HackerThresholdInputs;
