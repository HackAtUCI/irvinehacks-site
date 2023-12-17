import Image from "next/image";
import BasicInformation from "./BasicInformation";
import AgeInformation from "./AgeInformation";
import SchoolInformation from "./SchoolInformation";
import ProfileInformation from "./ProfileInformation";
import ResumeInformation from "./ResumeInformation";
import Button from "@/lib/components/Button/Button";
import koiLeft from "@/assets/images/koi-swim-left.png";
import koiRight from "@/assets/images/koi-swim-right.png";
import styles from "./Form.module.scss";

export default function Form() {
	return (
		<div className="relative w-full flex flex-col items-center">
			<Image
				src={koiLeft}
				height="250"
				alt="Koi fish"
				className={`${styles.image} absolute top-0 right-0`}
			/>
			<Image
				src={koiRight}
				height="250"
				alt="Koi fish"
				className={`${styles.image} absolute top-1/4 left-0`}
			/>
			<Image
				src={koiLeft}
				height="250"
				alt="Koi fish"
				className={`${styles.image} absolute top-1/2 right-0`}
			/>
			<Image
				src={koiRight}
				height="250"
				alt="Koi fish"
				className={`${styles.image} absolute top-3/4 left-0`}
			/>
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
		</div>
	);
}
