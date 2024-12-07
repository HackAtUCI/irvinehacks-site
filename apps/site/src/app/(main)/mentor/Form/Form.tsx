"use client";

import { FormEvent, useState } from "react";
import axios from "axios";

import Button from "@/lib/components/Button/Button";

import BasicInformation from "../../apply/sections/Form/BasicInformation";
import AgeInformation from "../../apply/sections/Form/AgeInformation";
import SchoolInformation from "../../apply/sections/Form/SchoolInformation";
import ProfileInformation from "../../apply/sections/Form/ProfileInformation";
import ResumeInformation from "../../apply/sections/Form/ResumeInformation";
import ShortAnswers from "./ShortAnswers";

import styles from "../../apply/sections/Form/Form.module.scss";
import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";
import RadioSelect from "@/lib/components/forms/RadioSelect";
import MultipleSelect from "@/lib/components/forms/MultipleSelect";
import Slider from "@/lib/components/forms/Slider";

// TODO: Whats the path for backend

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
			const otherField = `other_${field}`;
			if (formData.get(field) === "other") {
				formData.set(field, formData.get(otherField)!);
				formData.delete(otherField);
			}
		}

		// const formEntries = Object.fromEntries(formData.entries());
		// console.debug(formEntries);

		try {
			const res = await axios.post(APPLY_PATH, formData);
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

	const selectOptions = [
		{ name: "frontend", value: "frontend", text: "Frontend Web Development" },
		{ name: "backend", value: "backend", text: "Backend Web Development" },
		{ name: "mobile", value: "mobile", text: "Mobile App Development" },
		{ name: "databases", value: "databases", text: "Databases" },
		{ name: "ai/ml", value: "ai/ml", text: "AI / Machine Learning" },
		{ name: "vr", value: "vr", text: "Virtual Reality" },
		{ name: "blockchain", value: "blockchain", text: "Blockchain" },
		{
			name: "embedded",
			value: "embedded",
			text: "Embedded Systems / Hardware",
		},
		{ name: "data_science", value: "data_science", text: "Data Science" },
		{ name: "cybersecurity", value: "cybersecurity", text: "Cybersecurity" },
		{ name: "other", value: "other", text: "Other:" },
	];

	return (
		<form
			method="post"
			className={`${styles.form} text-[var(--color-white)] w-8/12 flex flex-col items-center py-12 gap-14 z-1 max-[800px]:w-9/12 max-[400px]:w-11/12 drop-shadow-[25px_33px_0px_rgba(255,255,255,1)]`}
			action="/api/user/apply"
			encType="multipart/form-data"
			onSubmit={handleSubmit}
		>
			<BasicInformation />
			<SchoolInformation />
			<ShortAnswers />
			<Slider pretext="No Experience" postText="Expert" name="git_experience" />
			<MultipleSelect
				labelText="What types of projects would you be comfortable mentoring?"
				identifierId="mentor_comfortable_select"
				containerClass="w-11/12"
				values={selectOptions}
			/>
			<ResumeInformation />
			<AgeInformation />
			<Button
				text="Submit"
				className="text-2xl !px-11 !py-2"
				isLightVersion={true}
				disabled={submitting}
			/>
			{sessionExpired && sessionExpiredMessage}
		</form>
	);
}
