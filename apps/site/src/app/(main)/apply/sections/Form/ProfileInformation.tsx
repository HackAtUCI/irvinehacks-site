import TextInput from "@/lib/components/forms/TextInput";
import Textfield from "@/lib/components/forms/Textfield";
import styles from "./Form.module.scss";

const FRQ_MAX_LENGTH = 2000;

export default function ProfileInformation() {
	return (
		<div className="text-white flex flex-col gap-5 w-11/12">
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
				name="frq_change"
				labelClass={`${styles.label} mt-7`}
				labelText="Give an example of a time when you experienced a lot of change. What did you learn from it, and how would you apply what you learned to future experiences? (150 words)"
				inputClass={`bg-[#ffffff] text-black p-3 h-48 resize-none rounded-xl`}
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={FRQ_MAX_LENGTH}
			/>

			<Textfield
				name="frq_video_game"
				labelClass={`${styles.label} mt-7`}
				labelText="If you could design your own video game world, what would it look like, and what features would you add to make it unique?  (100 words)"
				inputClass={`bg-[#ffffff] text-black p-3 h-48 resize-none rounded-xl`}
				containerClass="flex flex-col w-full"
				isRequired={true}
				maxLength={FRQ_MAX_LENGTH}
			/>
		</div>
	);
}
