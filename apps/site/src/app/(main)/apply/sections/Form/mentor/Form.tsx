"use client";

import { FormEvent, useState } from "react";
import axios from "axios";

import Button from "@/lib/components/Button/Button";

import BasicInformation from "./BasicInformation";
import AgeInformation from "../AgeInformation";
import SchoolInformation from "../SchoolInformation";
import ProfileInformation from "./ProfileInformation";
import ResumeInformation from "../ResumeInformation";
import ShortAnswers from "./ShortAnswers";

import hasDeadlinePassed from "@/lib/utils/hasDeadlinePassed";
import RadioSelect from "@/lib/components/forms/RadioSelect";
import ExperienceInformation from "./ExperienceInformation";
import Textfield from "@/lib/components/forms/Textfield";

import styles from "../Form.module.scss";

const APPLY_PATH = "/api/user/apply";
const FIELDS_WITH_OTHER = [
	"pronouns",
	"ethnicity",
	"school",
	"major",
	"other_mentor_experience",
];
const SELECT_OPTIONS = [
	"frontend",
	"backend",
	"mobile",
	"databases",
	"ai/ml",
	"vr",
	"blockchain",
	"embedded",
	"data_science",
	"cybersecurity",
];

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

		// Compile all technologies the mentor is comfortable with into one array
		const experienceList: Array<string> = [];
		for (const fieldName of Array.from(formData.keys())) {
			if (SELECT_OPTIONS.includes(fieldName)) {
				experienceList.push(fieldName);
				formData.delete(fieldName);
			}
		}
		formData.set(
			"mentor_experience_working_with",
			JSON.stringify(experienceList),
		);

		// const formEntries = Object.fromEntries(formData.entries());
		// console.log(formEntries);

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

	return (
		<form
			method="post"
			className={`${styles.form} text-[var(--color-white)] w-8/12 flex flex-col items-center py-12 gap-12 z-1 max-[800px]:w-9/12 max-[400px]:w-11/12 drop-shadow-[25px_33px_0px_rgba(255,255,255,1)]`}
			action="/api/user/apply"
			encType="multipart/form-data"
			onSubmit={handleSubmit}
		>
			<BasicInformation />
			<SchoolInformation />
			<ShortAnswers />
			<ExperienceInformation />
			<ResumeInformation isRequired />
			<RadioSelect
				name="resume_share_to_sponsors"
				containerClass="w-11/12"
				labelText="Would you like us to share your resume with our sponsors?"
				IdentifierId="resume_share"
				values={[
					{ value: "yes", text: "Yes" },
					{ value: "no", text: "No" },
				]}
			/>
			<ProfileInformation />
			<Textfield
				name="other_questions"
				labelClass={styles.label}
				labelText="Questions/comments/concerns?"
				inputClass="text-[var(--color-black)] bg-[#E1E1E1] p-3 h-48 resize-none rounded-xl"
				containerClass="flex flex-col w-11/12"
				isRequired={false}
			/>
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
