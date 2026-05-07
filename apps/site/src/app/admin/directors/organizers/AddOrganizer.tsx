import { useState } from "react";
import axios from "axios";

import ColumnLayout from "@cloudscape-design/components/column-layout";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Input from "@cloudscape-design/components/input";
import FormField from "@cloudscape-design/components/form-field";
import Checkbox from "@cloudscape-design/components/checkbox";
import Box from "@cloudscape-design/components/box";

import AddOrganizerModal from "./AddOrganizerModal";

// eslint-disable-next-line no-useless-escape
const EMAIL_REGEX = /^\w+([\.\-]?\w+)*@uci.edu/;

export interface RawOrganizer {
	email: string;
	first_name: string;
	last_name: string;
	roles: ReadonlyArray<string>;
	committees: ReadonlyArray<string>;
}

function AddOrganizer() {
	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");

	const [isCorporate, setCorporate] = useState(false);
	const [isLogistics, setLogistics] = useState(false);
	const [isDesign, setDesign] = useState(false);
	const [isTech, setTech] = useState(false);
	const [isMarketing, setMarketing] = useState(false);

	const [isCheckInLead, setCheckInLead] = useState(false);
	const [isHackerReviewer, setHackerReviewer] = useState(true);
	const [isMentorReviewer, setMentorReviewer] = useState(false);
	const [isVolunteerReviewer, setVolunteerReviewer] = useState(false);
	const [isCommunicationsLead, setCommunicationsLead] = useState(false);
	const [isEmcee, setEmcee] = useState(false);
	const [isDecorationsMember, setDecorationsMember] = useState(false);
	const [isFoodMember, setFoodMember] = useState(false);
	const [isJudgingLead, setJudgingLead] = useState(false);
	const [isSocialEventsMember, setSocialEventsMember] = useState(false);
	const [isSwagMember, setSwagMember] = useState(false);
	const [isWorkshopMember, setWorkshopMember] = useState(false);

	const [organizer, setOrganizer] = useState<RawOrganizer | null>(null);
	const [invalidEmailError, setInvalidEmailError] = useState("");
	const [noCommitteeError, setNoCommitteeError] = useState("");

	function updateOrganizer() {
		if (!EMAIL_REGEX.test(email)) {
			setInvalidEmailError("Not a valid UCI email");
			return;
		} else {
			setInvalidEmailError("");
		}

		const committees = [];
		if (isCorporate) committees.push("Corporate");
		if (isDesign) committees.push("Design");
		if (isLogistics) committees.push("Logistics");
		if (isMarketing) committees.push("Marketing");
		if (isTech) committees.push("Tech");

		if (committees.length == 0) {
			setNoCommitteeError("Please select at least one committee");
			return;
		} else {
			setNoCommitteeError("");
		}

		const roles = ["Organizer"];
		if (isCheckInLead) roles.push("Check-in Lead");
		if (isHackerReviewer) roles.push("Hacker Reviewer");
		if (isMentorReviewer) roles.push("Mentor Reviewer");
		if (isVolunteerReviewer) roles.push("Volunteer Reviewer");
		if (isCommunicationsLead) roles.push("Communications Lead");
		if (isEmcee) roles.push("Emcee");
		if (isDecorationsMember) roles.push("Decorations Member");
		if (isFoodMember) roles.push("Food Member");
		if (isJudgingLead) roles.push("Judging Lead");
		if (isSocialEventsMember) roles.push("Social Events Member");
		if (isSwagMember) roles.push("Swag Member");
		if (isWorkshopMember) roles.push("Workshop Member");

		setOrganizer({
			email,
			first_name: firstName,
			last_name: lastName,
			roles,
			committees,
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
			<SpaceBetween direction="vertical" size="l">
				<ColumnLayout columns={3}>
					<FormField label="Email" errorText={invalidEmailError}>
						<Input
							onChange={({ detail }) => setEmail(detail.value)}
							value={email}
							inputMode="email"
							placeholder="netid@uci.edu"
						/>
					</FormField>
					<FormField label="First name">
						<Input
							onChange={({ detail }) => setFirstName(detail.value)}
							value={firstName}
							inputMode="text"
							placeholder="First name"
						/>
					</FormField>
					<FormField label="Last name">
						<Input
							onChange={({ detail }) => setLastName(detail.value)}
							value={lastName}
							inputMode="text"
							placeholder="Last name"
						/>
					</FormField>
				</ColumnLayout>

				<ColumnLayout columns={2} variant="text-grid">
					<FormField label="Roles">
						<ColumnLayout columns={2} variant="text-grid">
							<Checkbox
								onChange={({ detail }) => setCheckInLead(detail.checked)}
								checked={isCheckInLead}
							>
								Check-in Lead
							</Checkbox>
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
							<Checkbox
								onChange={({ detail }) => setCommunicationsLead(detail.checked)}
								checked={isCommunicationsLead}
							>
								Communications Lead
							</Checkbox>
							<Checkbox
								onChange={({ detail }) => setEmcee(detail.checked)}
								checked={isEmcee}
							>
								Emcee
							</Checkbox>
							<Checkbox
								onChange={({ detail }) => setDecorationsMember(detail.checked)}
								checked={isDecorationsMember}
							>
								Decorations Member
							</Checkbox>
							<Checkbox
								onChange={({ detail }) => setFoodMember(detail.checked)}
								checked={isFoodMember}
							>
								Food Member
							</Checkbox>
							<Checkbox
								onChange={({ detail }) => setJudgingLead(detail.checked)}
								checked={isJudgingLead}
							>
								Judging Lead
							</Checkbox>
							<Checkbox
								onChange={({ detail }) => setSocialEventsMember(detail.checked)}
								checked={isSocialEventsMember}
							>
								Social Events Member
							</Checkbox>
							<Checkbox
								onChange={({ detail }) => setSwagMember(detail.checked)}
								checked={isSwagMember}
							>
								Swag Member
							</Checkbox>
							<Checkbox
								onChange={({ detail }) => setWorkshopMember(detail.checked)}
								checked={isWorkshopMember}
							>
								Workshop Member
							</Checkbox>
						</ColumnLayout>
					</FormField>

					<FormField label="Committee" errorText={noCommitteeError}>
						<Box float="right">
							<Button variant="primary" onClick={updateOrganizer}>
								Add Organizer
							</Button>
						</Box>
						<SpaceBetween direction="vertical" size="xs">
							<Checkbox
								onChange={({ detail }) => setCorporate(detail.checked)}
								checked={isCorporate}
							>
								Corporate
							</Checkbox>
							<Checkbox
								onChange={({ detail }) => setLogistics(detail.checked)}
								checked={isLogistics}
							>
								Logistics
							</Checkbox>
							<Checkbox
								onChange={({ detail }) => setDesign(detail.checked)}
								checked={isDesign}
							>
								Design
							</Checkbox>
							<Checkbox
								onChange={({ detail }) => setMarketing(detail.checked)}
								checked={isMarketing}
							>
								Marketing
							</Checkbox>
							<Checkbox
								onChange={({ detail }) => setTech(detail.checked)}
								checked={isTech}
							>
								Tech
							</Checkbox>
						</SpaceBetween>
					</FormField>
				</ColumnLayout>
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
