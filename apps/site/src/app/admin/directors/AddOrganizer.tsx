import { useState } from "react";
import axios from "axios";

import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import FormField from "@cloudscape-design/components/form-field";
import Checkbox from "@cloudscape-design/components/checkbox";

import AddOrganizerModal from "./AddOrganizerModal";

const EMAIL_REGEX = /^\w+([\.\-]?\w+)*@uci.edu/;

export interface RawOrganizer {
	email: string;
	first_name: string;
	last_name: string;
	roles: ReadonlyArray<string>;
}

function AddOrganizer() {
	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [isHackerReviewer, setHackerReviewer] = useState(true);
	const [isMentorReviewer, setMentorReviewer] = useState(false);
	const [isVolunteerReviewer, setVolunteerReviewer] = useState(false);
	const [organizer, setOrganizer] = useState<RawOrganizer | null>(null);

	const [invalidEmailError, setInvalidEmailError] = useState("");

	function updateOrganizer() {
		if (!EMAIL_REGEX.test(email)) {
			setInvalidEmailError("Not a valid UCI email");
			return;
		} else {
			setInvalidEmailError("");
		}

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

		setOrganizer({
			email: email,
			first_name: firstName,
			last_name: lastName,
			roles: roles,
		});
	}

	async function submitOrganizer() {
		await axios
			.post("/api/director/organizers", organizer)
			.then(() => {
				window.location.reload();
			})
			.catch((error) => console.error(error));
	}

	return (
		<>
			<SpaceBetween direction="horizontal" size="l">
				<FormField label="Email" errorText={invalidEmailError}>
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
				<Button variant="primary" onClick={updateOrganizer}>
					Add Organizer
				</Button>
			</SpaceBetween>
			<AddOrganizerModal
				onDismiss={() => setOrganizer(null)}
				onConfirm={submitOrganizer}
				organizer={organizer}
			/>
		</>
	);
}

export default AddOrganizer;
