import TextInput from "@/lib/components/forms/TextInput";
import Textfield from "@/lib/components/forms/Textfield";
import styles from "./Form.module.scss";

const FRQ_MAX_LENGTH = 2000;

export default function ProfileInformation() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<p className="text-4xl m-0 font-bold text-center max-[700px]:text-3xl">
				Profile Information
			</p>

			<div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
				<TextInput
					name="linkedin"
					labelClass={styles.label}
					labelText="LinkedIn"
					inputClass={styles.input}
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={false}
					type="url"
					placeholder="https://"
				/>
				<TextInput
					name="portfolio"
					labelClass={styles.label}
					labelText="Portfolio (Github, website, etc.)"
					inputClass={styles.input}
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={false}
					type="url"
					placeholder="https://"
				/>
			</div>

			<Textfield
				name="frq_collaboration"
				labelClass={`${styles.label} mt-7`}
				labelText="Why is collaboration important to being a programmer or technologist, and what does it mean to you? (150 words)"
				inputClass={`bg-[#E1E1E1] p-3 h-48 resize-none rounded-xl`}
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={FRQ_MAX_LENGTH}
			/>

			<Textfield
				name="frq_dream_job"
				labelClass={`${styles.label} mt-7`}
				labelText="If you could have any job in the world, what would it be? (ex. YouTuber, Body Builder, etc.) (100 words)"
				inputClass={`bg-[#E1E1E1] p-3 h-48 resize-none rounded-xl`}
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={FRQ_MAX_LENGTH}
			/>
		</div>
	);
}
