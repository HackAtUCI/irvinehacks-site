import TextInput from "@/lib/components/forms/TextInput";
import styles from "../Form.module.scss";

export default function ProfileInformation() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">Links</p>

			<TextInput
				name="linkedin"
				labelClass={styles.label}
				labelText="LinkedIn"
				inputClass={styles.input}
				containerClass="flex flex-col w-full"
				isRequired={false}
				type="url"
				placeholder="https://"
			/>
			<TextInput
				name="github"
				labelClass={styles.label}
				labelText="Github"
				inputClass={styles.input}
				containerClass="flex flex-col w-full"
				isRequired={false}
				type="url"
				placeholder="https://"
			/>
			<TextInput
				name="portfolio"
				labelClass={styles.label}
				labelText="Personal Website / Portfolio"
				inputClass={styles.input}
				containerClass="flex flex-col w-full"
				isRequired={false}
				type="url"
				placeholder="https://"
			/>
		</div>
	);
}
