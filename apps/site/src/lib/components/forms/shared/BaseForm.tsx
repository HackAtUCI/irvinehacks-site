"use client";

import { FormEvent, PropsWithChildren, useState } from "react";
import Image from "next/image";
import axios from "axios";

import Button from "@/lib/components/Button/Button";

import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";

import cityBackground from "@/assets/backgrounds/alt_illus_moonless.png";

// Ensure this array matches FIELDS_SUPPORTING_OTHER in ApplicationData.py
const FIELDS_WITH_OTHER = [
	"pronouns",
	"ethnicity",
	"school",
	"major",
	"tech_experienced_technologies",
	"hardware_experienced_technologies",
	"design_experienced_tools",
	"dietary_restrictions",
	"ih_reference",
];

interface BaseFormProps {
	applicationType: "Hacker" | "Mentor" | "Volunteer";
	applyPath: string;
}

export default function BaseForm({
	applicationType,
	applyPath,
	children,
}: PropsWithChildren<BaseFormProps>) {
	const [submitting, setSubmitting] = useState(false);
	const [sessionExpired, setSessionExpired] = useState(false);

	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>,
	): Promise<void> => {
		// Disable native post submission
		event.preventDefault();

		// On the chance that a user presses submit after the deadline,
		// this check is to prevent the application from submitting
		// and to show the message that applications have closed
		if (hasDeadlinePassed()) {
			window.location.reload();
			return;
		}

		setSubmitting(true);
		setSessionExpired(false);

		const formData = new FormData(event.currentTarget);

		// Use other values when selected
		for (const field of FIELDS_WITH_OTHER) {
			const otherField = `_other_${field}`;
			const otherFieldValue = formData.get(otherField);

			formData.delete(otherField);

			const valuesWithoutOther = formData
				.getAll(field)
				.filter((value) => value !== "other");

			formData.delete(field);

			for (const value of valuesWithoutOther) formData.append(field, value);

			if (otherFieldValue) formData.append(field, otherFieldValue);
		}

		try {
			const res = await axios.post(applyPath, formData);
			if (res.status === 201) {
				console.log("Application submitted");

				// Use window.location instead of router.push in order
				// to force reload the page to allow user identity to
				// update with the new status
				window.location.href = "/portal";
				return;
			}
		} catch (err) {
			console.error(err);
			if (axios.isAxiosError(err)) {
				if (err.response?.status === 401) {
					setSessionExpired(true);
				}
			}
		}

		setSubmitting(false);
	};

	const sessionExpiredMessage = (
		<p className="text-red-500 w-11/12">
			Your session has expired. Please{" "}
			<a href="/login" target="_blank" className="text-blue-600 underline">
				log in from a new tab
			</a>{" "}
			to restore your session and then try submitting again.
		</p>
	);

	return (
		<div className="min-h-[100dvh]">
			<div className="fixed inset-0 -z-10 pointer-events-none">
				<Image
					src={cityBackground}
					alt="Background image"
					fill
					priority
					quality={100}
					sizes="100vw"
					className="object-cover"
				/>
			</div>

			<div className="relative z-10 flex justify-center py-12">
				<form
					method="post"
					action={applyPath}
					encType="multipart/form-data"
					onSubmit={handleSubmit}
					className="bg-black border-[4px] border-white text-[var(--color-white)] w-[92vw] max-w-[820px] flex flex-col items-center py-12 gap-14"
				>
					<input
						type="text"
						name="application_type"
						value={applicationType}
						readOnly
						hidden
					/>
					{children}
					<Button
						text="Submit"
						className="text-2xl !px-11 !py-2"
						isLightVersion={true}
						disabled={submitting}
					/>
					{sessionExpired && sessionExpiredMessage}
				</form>
			</div>
		</div>
	);
}
