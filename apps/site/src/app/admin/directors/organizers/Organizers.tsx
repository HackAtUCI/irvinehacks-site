"use client";

import { useRouter } from "next/navigation";

import { useContext, useMemo, useState } from "react";

import axios from "axios";
import Cards from "@cloudscape-design/components/cards";
import Box from "@cloudscape-design/components/box";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import Multiselect, {
	MultiselectProps,
} from "@cloudscape-design/components/multiselect";
import SpaceBetween from "@cloudscape-design/components/space-between";

import ConfirmationModal from "../email-sender/components/ConfirmationModal";
import EditOrganizerModal, { type OrganizerUpdate } from "./EditOrganizerModal";
import UserContext from "@/lib/admin/UserContext";
import { isDirector } from "@/lib/admin/authorization";
import { EDITABLE_COMMITTEES, EDITABLE_ROLES } from "@/lib/admin/EditableRoles";

import AddOrganizer from "./AddOrganizer";
import useOrganizers, { Organizer } from "@/lib/admin/useOrganizers";

type Options = ReadonlyArray<MultiselectProps.Option>;

const createCardHeaderFactory = (
	onEdit: (organizer: Organizer) => void,
	onRemove: (organizer: Organizer) => void,
) =>
	function OrganizerCardHeader(organizer: Organizer) {
		return (
			<CardHeader
				organizer={organizer}
				onEdit={() => onEdit(organizer)}
				onRemove={() => onRemove(organizer)}
			/>
		);
	};

function createOptions(values: ReadonlyArray<string>): Options {
	return Array.from(new Set(values))
		.sort((a, b) => a.localeCompare(b))
		.map((value) => ({ label: value, value }));
}

function selectedValues(options: Options): string[] {
	return options
		.map((option) => option.value)
		.filter((value): value is string => value !== undefined);
}

function Organizers() {
	const router = useRouter();

	const { roles } = useContext(UserContext);

	if (!isDirector(roles)) {
		router.push("/admin/dashboard");
	}

	const { organizerList, loading, mutate } = useOrganizers();
	const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(
		null,
	);
	const [removingOrganizer, setRemovingOrganizer] = useState<Organizer | null>(
		null,
	);
	const [selectedRoles, setSelectedRoles] = useState<Options>([]);
	const [selectedCommittees, setSelectedCommittees] = useState<Options>([]);

	const roleOptions = useMemo(() => createOptions(EDITABLE_ROLES), []);
	const committeeOptions = useMemo(
		() => createOptions(EDITABLE_COMMITTEES),
		[],
	);
	const filteredOrganizers = useMemo(() => {
		const roleFilters = selectedValues(selectedRoles);
		const committeeFilters = selectedValues(selectedCommittees);

		return organizerList.filter((organizer) => {
			const matchesRole =
				roleFilters.length === 0 ||
				roleFilters.some((role) => organizer.roles.includes(role));
			const matchesCommittee =
				committeeFilters.length === 0 ||
				committeeFilters.some((committee) =>
					organizer.committees.includes(committee),
				);

			return matchesRole && matchesCommittee;
		});
	}, [organizerList, selectedCommittees, selectedRoles]);

	const counter =
		filteredOrganizers.length === organizerList.length
			? `(${organizerList.length})`
			: `(${filteredOrganizers.length}/${organizerList.length})`;

	const emptyContent = (
		<Box textAlign="center" color="inherit">
			No Organizers
		</Box>
	);

	async function updateOrganizer(uid: string, organizer: OrganizerUpdate) {
		await axios.post("/api/director/update-organizers", { uid, ...organizer });
	}

	async function deleteOrganizer(organizer: Organizer) {
		await axios.post("/api/director/delete-organizers", { uid: organizer._id });
	}

	return (
		<>
			<Cards
				cardDefinition={{
					header: createCardHeaderFactory(
						setEditingOrganizer,
						setRemovingOrganizer,
					),
					sections: [
						{
							id: "uid",
							header: "UID",
							content: ({ _id }) => _id,
						},
						{
							id: "roles",
							header: "Roles",
							content: ({ roles }) => roles.join(", "),
						},
						{
							id: "committees",
							header: "Committees",
							content: ({ committees }) => committees.join(", "),
						},
					],
				}}
				loading={loading}
				loadingText="Loading applicants"
				items={filteredOrganizers}
				trackBy="_id"
				variant="full-page"
				empty={emptyContent}
				filter={
					<SpaceBetween direction="horizontal" size="s">
						<Multiselect
							selectedOptions={selectedRoles}
							onChange={({ detail }) =>
								setSelectedRoles(detail.selectedOptions)
							}
							options={roleOptions}
							placeholder="Filter by role"
							selectedAriaLabel="Selected"
						/>
						<Multiselect
							selectedOptions={selectedCommittees}
							onChange={({ detail }) =>
								setSelectedCommittees(detail.selectedOptions)
							}
							options={committeeOptions}
							placeholder="Filter by committee"
							selectedAriaLabel="Selected"
						/>
					</SpaceBetween>
				}
				header={
					<Header counter={counter} actions={<AddOrganizer />}>
						Organizers
					</Header>
				}
			/>

			<EditOrganizerModal
				organizer={editingOrganizer}
				onDismissAction={() => setEditingOrganizer(null)}
				onConfirmAction={async (organizer) => {
					if (!editingOrganizer) {
						return;
					}
					await updateOrganizer(editingOrganizer._id, organizer);
					await mutate();
					setEditingOrganizer(null);
				}}
			/>

			<ConfirmationModal
				buttonText="Remove Organizer"
				modalText={`Remove organizer ${removingOrganizer?.first_name} ${removingOrganizer?.last_name}?`}
				onConfirm={async () => {
					if (!removingOrganizer) {
						return;
					}

					await deleteOrganizer(removingOrganizer);
					await mutate();
					setRemovingOrganizer(null);
				}}
				visible={removingOrganizer !== null}
				setVisible={(visible) => {
					if (!visible) {
						setRemovingOrganizer(null);
					}
				}}
			/>
		</>
	);
}

interface CardHeaderProps {
	organizer: Organizer;
	onEdit: () => void;
	onRemove: () => void;
}

const CardHeader = ({ organizer, onEdit, onRemove }: CardHeaderProps) => {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				width: "100%",
			}}
		>
			<span>
				{organizer.first_name} {organizer.last_name}
			</span>
			<SpaceBetween direction="horizontal" size="xs">
				<Button
					iconName="edit"
					variant="icon"
					ariaLabel={`Edit roles for ${organizer.first_name} ${organizer.last_name}`}
					onClick={onEdit}
				/>
				<Button
					iconName="remove"
					variant="icon"
					ariaLabel={`Remove roles from ${organizer.first_name} ${organizer.last_name}`}
					onClick={onRemove}
				/>
			</SpaceBetween>
		</div>
	);
};

export default Organizers;
