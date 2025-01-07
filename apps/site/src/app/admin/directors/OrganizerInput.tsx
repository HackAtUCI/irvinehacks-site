import { useState } from "react";
import axios from "axios";

import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import FormField from "@cloudscape-design/components/form-field";
import Checkbox from "@cloudscape-design/components/checkbox";

function OrganizerInput() {
	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [isHackerReviewer, setHackerReviewer] = useState(true);
	const [isMentorReviewer, setMentorReviewer] = useState(false);
	const [isVolunteerReviewer, setVolunteerReviewer] = useState(false);

	async function submitOrganizer() {
		const roles = ["Organizer"];
		if (isHackerReviewer) {
			roles.push("Hacker Reviewer");
		}
		if (isMentorReviewer) {
			roles.push("Mentor Reviewer");
		}
		if (isVolunteerReviewer) {
			roles.push("Volunteer Reviewer");
		}

		await axios.post("/api/director/organizers", {
			email: email,
			first_name: firstName,
			last_name: lastName,
			roles: roles,
		});
	}

	return (
		<SpaceBetween direction="horizontal" size="l">
			<FormField label="Email">
				<Input
					onChange={({ detail }) => setEmail(detail.value)}
					value={email}
					inputMode="email"
					placeholder="Organizer UCI Email"
				/>
			</FormField>
			<FormField label="First Name">
				<Input
					onChange={({ detail }) => setFirstName(detail.value)}
					value={firstName}
					inputMode="text"
					placeholder="First Name"
				/>
			</FormField>
			<FormField label="Last Name">
				<Input
					onChange={({ detail }) => setLastName(detail.value)}
					value={lastName}
					inputMode="text"
					placeholder="Last Name"
				/>
			</FormField>
			<FormField label="Reviewer roles">
				<Checkbox
					onChange={({ detail }) => setHackerReviewer(detail.checked)}
					checked={isHackerReviewer}
				>
					Hacker Reviewer
				</Checkbox>
				<Checkbox
					onChange={({ detail }) => setMentorReviewer(detail.checked)}
					checked={isMentorReviewer}
				>
					Mentor Reviewer
				</Checkbox>
				<Checkbox
					onChange={({ detail }) => setVolunteerReviewer(detail.checked)}
					checked={isVolunteerReviewer}
				>
					Volunteer Reviewer
				</Checkbox>
			</FormField>
			<Button variant="primary" onClick={submitOrganizer}>
				Add Organizer
			</Button>
		</SpaceBetween>
	);
}

export default OrganizerInput;
