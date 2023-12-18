import Button from "@/lib/components/Button/Button";

import BasicInformation from "./BasicInformation";
import AgeInformation from "./AgeInformation";
import SchoolInformation from "./SchoolInformation";
import ProfileInformation from "./ProfileInformation";
import ResumeInformation from "./ResumeInformation";

import styles from "./Form.module.scss";

export default function Form() {
	return (
		<form
			method="post"
			className={`${styles.form} text-[#000000] w-8/12 flex flex-col items-center py-12 gap-10 z-1 max-[800px]:w-9/12 max-[400px]:w-11/12`}
			action="/api/user/apply"
			encType="multipart/form-data"
		>
			<BasicInformation />
			<SchoolInformation />
			<ProfileInformation />
			<ResumeInformation />
			<AgeInformation />
			<Button text="Submit Application" />
		</form>
	);
}
