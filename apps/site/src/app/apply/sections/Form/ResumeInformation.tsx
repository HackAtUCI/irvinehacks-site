"use client";

import RequiredAsterisk from "@/app/apply/sections/Components/RequiredAsterisk";

import uploadImage from "@/assets/icons/upload-resume-icon.svg";
import Image from "next/image";

import styles from "./Form.module.scss";
import { ChangeEvent, useState } from "react";

export default function ResumeInformation() {
	const [resumePath, setResumePath] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();

		setErrorMessage("");
		setResumePath("");

		let file = event.target.files ? event.target.files[0] : null;
		if (handleFile(file) == false) {
			event.target.value = "";
		}
	};

	const handleDropUpload = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault();

		setErrorMessage("");
		setResumePath("");
		let file = event.dataTransfer.files
			? event.dataTransfer.files[0]
			: null;
		handleFile(file);
	};

	const handleFile = (file: File | null) => {
		if (file) {
			let path = file.name;

			let extension = path.split(".").pop();
			if (extension != "pdf") {
				setErrorMessage("Invalid file format");
				return false;
			}

			if (file.size > 500000) {
				setErrorMessage("Invalid file size (file size exceeds 0.5 MB)");
				return false;
			}

			setResumePath(path);
		}
		return true;
	};

	const getOutputMessage = () => {
		if (errorMessage) {
			return (
				<span className="text-[#FF2222] text-xl">{errorMessage}</span>
			);
		}

		return (
			<span className="text-xl">
				{resumePath ? "Uploaded " + resumePath : ""}
			</span>
		);
	};

	return (
		<div className="flex flex-col items-start w-11/12">
			<label className={styles.label}>
				Resume (PDF, 0.5 MB max) <RequiredAsterisk />
			</label>
			<label
				htmlFor="resume-upload"
				className={`${styles.upload} cursor-pointer mb-3`}
				onDragOver={(event) => {event.preventDefault();}}
				onDrop={handleDropUpload}
			>
				<Image src={uploadImage} width="100" alt="Upload resume icon" />
				<h2>Drag & Drop</h2>
			</label>
			<input
				className="hidden"
				id="resume-upload"
				type="file"
				onChange={handleFileUpload}
			></input>
			{getOutputMessage()}
		</div>
	);
}
