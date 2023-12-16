"use client";

import RequiredAsterisk from "@/app/apply/sections/Components/RequiredAsterisk";

import uploadImage from "@/assets/icons/upload-resume-icon.svg";
import Image from "next/image";

import styles from "./Form.module.scss";

export default function ResumeInformation() {
	return (
		<div className="flex flex-col items-start w-11/12">
			<label className={styles.label}>
				Resume (PDF, 0.5 MB max) <RequiredAsterisk />
			</label>
			<button
				type="button"
				className={`${styles.upload} flex flex-col cursor-pointer mt-1`}
				onClick={() => {
					console.log("clicked");
				}}
			>
				<Image src={uploadImage} width="100" alt="Upload resume icon" />
				<h2>Drag & Drop</h2>
			</button>
		</div>
	);
}
