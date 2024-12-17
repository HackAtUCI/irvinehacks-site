"use client";

import { ChangeEvent, useEffect, useState, useRef } from "react";

import { FileCheck, FileText, FileWarning } from "lucide-react";

import OutputFeedBack from "./ResumeOutputFeedback";
import RequiredAsterisk from "@/lib/components/forms/RequiredAsterisk";

class InvalidFile extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidFile";
	}
}

interface ResumeInformationProps {
	isRequired?: boolean;
}

export default function ResumeInformation({
	isRequired,
}: ResumeInformationProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [resumePath, setResumePath] = useState<string>("");
	const [hasUploaded, setHasUploaded] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}, []);

	const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();

		setErrorMessage("");
		setResumePath("");

		const file = event.target.files ? event.target.files[0] : null;
		try {
			handleFile(file);
		} catch (error) {
			event.target.value = "";
		}
		setHasUploaded(true);
	};

	const handleFile = (file: File | null) => {
		if (!file) throw TypeError;

		const path = file.name;

		const extension = path.split(".").pop();
		if (extension !== "pdf") {
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
			<label className="text-lg mb-2">
				Resume (PDF, 0.5 MB max) {isRequired && <RequiredAsterisk />}
			</label>
			<label
				htmlFor="resume_upload"
				className="cursor-pointer mb-3 p-5 rounded-xl text-[#000] bg-[#e1e1e1]"
			>
				{!hasUploaded ? (
					<FileText className="m-auto" width={50} height={50} />
				) : errorMessage === "" ? (
					<FileCheck className="m-auto" width={50} height={50} color="green" />
				) : (
					<FileWarning className="m-auto" width={50} height={50} color="red" />
				)}
				<h2 className="text-center">Upload file</h2>
			</label>
			<input
				ref={inputRef}
				className="opacity-0 absolute"
				name="resume"
				id="resume_upload"
				type="file"
				accept="application/pdf"
				onChange={handleFileUpload}
				required={isRequired}
			/>
			<OutputFeedBack errorMessage={errorMessage} resumePath={resumePath} />
		</div>
	);
}
