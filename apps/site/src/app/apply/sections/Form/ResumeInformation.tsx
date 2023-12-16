"use client";

import { ChangeEvent, useState } from "react";

import RequiredAsterisk from "@/app/apply/sections/Components/RequiredAsterisk";
import OutputFeedBack from "./ResumeOutputFeedback";

import uploadImage from "@/assets/icons/upload-resume-icon.svg";
import Image from "next/image";

import styles from "./Form.module.scss";

import clsx from "clsx";

export default function ResumeInformation() {
	const [resumePath, setResumePath] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isHovered, setIsHovered] = useState(false);

	const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
		setIsHovered(false);
		event.preventDefault();

		setErrorMessage("");
		setResumePath("");

		let file = event.target.files ? event.target.files[0] : null;
		if (handleFile(file) == false) {
			event.target.value = "";
		}
	};

	const handleDropUpload = (event: React.DragEvent<HTMLLabelElement>) => {
		setIsHovered(false);
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

	return (
		<div className="flex flex-col items-start w-11/12">
			<label className={styles.label}>
				Resume (PDF, 0.5 MB max) <RequiredAsterisk />
			</label>
			<label
				htmlFor="resume-upload"
				className={clsx(
					isHovered ? "bg-[#999999]" : "bg-[#e1e1e1]",
					`${styles.upload} cursor-pointer mb-3`,
				)}
				onDragOver={(event) => {
					event.preventDefault();
				}}
				onDragEnter={() => {
					setIsHovered(true);
				}}
				onDragLeave={() => {
					setIsHovered(false);
				}}
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
			<OutputFeedBack
				errorMessage={errorMessage}
				resumePath={resumePath}
			/>
		</div>
	);
}
