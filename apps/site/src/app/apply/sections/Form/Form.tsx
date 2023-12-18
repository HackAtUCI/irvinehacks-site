"use client";

import { FormEvent, useState } from "react";
import { redirect } from "next/navigation";
import axios from "axios";

import Button from "@/lib/components/Button/Button";

import BasicInformation from "./BasicInformation";
import AgeInformation from "./AgeInformation";
import SchoolInformation from "./SchoolInformation";
import ProfileInformation from "./ProfileInformation";
import ResumeInformation from "./ResumeInformation";

import styles from "./Form.module.scss";

const APPLY_PATH = "/api/user/apply";
const FIELDS_WITH_OTHER = ["pronouns", "ethnicity", "school", "major"];

export default function Form() {
	const [submitting, setSubmitting] = useState(false);
	const [sessionExpired, setSessionExpired] = useState(false);

	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>,
	): Promise<void> => {
		// Disable native post submission
		event.preventDefault();
		setSubmitting(true);
		setSessionExpired(false);

		const formData = new FormData(event.currentTarget);

		// Use other values when selected
		for (const field of FIELDS_WITH_OTHER) {
			const otherField = `other_${field}`;
			if (formData.get(field) === "other") {
				formData.set(field, formData.get(otherField)!);
				formData.delete(otherField);
			}
		}

		const formEntries = Object.fromEntries(formData.entries());
		console.debug(formEntries);

		try {
			const res = await axios.post(APPLY_PATH, formData);
			if (res.status === 201) {
				console.log("Application submitted");
				redirect("/portal");
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
			<a
				href="/login"
				target="_blank"
				className="text-blue-600 underline"
			>
				log in from a new tab
			</a>{" "}
			to restore your session and then try submitting again.
		</p>
	);

	return (
		<form
			method="post"
			className={`${styles.form} text-[#000000] w-8/12 flex flex-col items-center py-12 gap-10 z-1 max-[800px]:w-9/12 max-[400px]:w-11/12`}
			action="/api/user/apply"
			encType="multipart/form-data"
			onSubmit={handleSubmit}
		>
			<BasicInformation />
			<SchoolInformation />
			<ProfileInformation />
			<ResumeInformation />
			<AgeInformation />
			<Button text="Submit Application" disabled={submitting} />
			{sessionExpired && sessionExpiredMessage}
		</form>
	);
}
