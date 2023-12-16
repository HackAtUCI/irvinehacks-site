"use client";

import { ChangeEvent, useEffect, useState, useRef } from "react";

import RequiredAsterisk from "@/app/apply/sections/Components/RequiredAsterisk";
import OutputFeedBack from "./ResumeOutputFeedback";

import uploadImage from "@/assets/icons/upload-resume-icon.svg";
import Image from "next/image";

import styles from "./Form.module.scss";

class InvalidFile extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidFile";
	}
}

export default function ResumeInformation() {
	const inputRef = useRef<HTMLInputElement>(null);
	const [resumePath, setResumePath] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}, []);

	const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();

		setErrorMessage("");
		setResumePath("");

		let file = event.target.files ? event.target.files[0] : null;
		try {
			handleFile(file);
		} catch (error) {
			event.target.value = "";
		}
	};

	const handleFile = (file: File | null) => {
		if (!file) throw TypeError;

		let path = file.name;

		let extension = path.split(".").pop();
		if (extension != "pdf") {
			setErrorMessage("Invalid file format");
			throw new InvalidFile("Invalid file format");
		}

		if (file.size > 500000) {
			setErrorMessage("Invalid file size (file size exceeds 0.5 MB)");
			throw new InvalidFile("Invalid file size");
		}
		setResumePath(path);
	};

	return (
		<div className="flex flex-col items-start w-11/12">
			<label className={styles.label}>
				Resume (PDF, 0.5 MB max) <RequiredAsterisk />
			</label>
			<label
				htmlFor="resume_upload"
				className={`${styles.upload} cursor-pointer mb-3`}
			>
				<Image src={uploadImage} width="100" alt="Upload resume icon" />
				<h2 className="text-center">Upload file</h2>
			</label>
			<input
				ref={inputRef}
				className="opacity-0 absolute"
				name="resume_upload"
				id="resume_upload"
				type="file"
				accept="application/pdf"
				onChange={handleFileUpload}
				required
			></input>
			<OutputFeedBack
				errorMessage={errorMessage}
				resumePath={resumePath}
			/>
		</div>
	);
}
