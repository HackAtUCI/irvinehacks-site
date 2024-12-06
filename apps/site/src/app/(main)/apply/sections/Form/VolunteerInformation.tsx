"use client";

import { ChangeEvent, useEffect, useState, useRef } from "react";

import Textfield from "@/lib/components/forms/Textfield";

class InvalidFile extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidFile";
	}
}

export default function ResumeInformation() {
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
			<Textfield
				name="volunteer_q1"
				labelText="Why are you interested in volunteering, and what do you expect to gain from this experience?"
				labelClass=""
				containerClass=""
				inputClass=""
				isRequired={true}
				maxLength={1500}
			/>
			<Textfield
				name="volunteer_q2"
				labelText="If you were a kitchen utensil, what would you be and why?"
				labelClass=""
				containerClass=""
				inputClass=""
				isRequired={true}
				maxLength={1500}
			/>
			<Textfield
				name="volunteer_q3"
				labelText="Why are you interested in volunteering, and what do you expect to gain from this experience?"
				labelClass=""
				containerClass=""
				inputClass=""
				isRequired={true}
				maxLength={1500}
			/>
		</div>
	);
}
