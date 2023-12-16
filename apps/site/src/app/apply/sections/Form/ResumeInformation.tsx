"use client";

import RequiredAsterisk from "@/app/apply/sections/Components/RequiredAsterisk";

import uploadImage from "@/assets/icons/upload-resume-icon.svg";
import Image from "next/image";

import styles from "./Form.module.scss";

export default function ResumeInformation() {
	return (
		<div className="flex flex-col items-start w-11/12">
			<label htmlFor="resume-upload" className={styles.label}>
				Resume (PDF, 0.5 MB max) <RequiredAsterisk />
			</label>
			<label htmlFor="resume-upload" className={`${styles.upload} cursor-pointer`}>
				<Image src={uploadImage} width="100" alt="Upload resume icon" />
				<h2>Drag & Drop</h2>
			</label>
			<input className="hidden" id="resume-upload" type="file"></input>
		</div>
	);
}
