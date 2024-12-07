import TextInput from "@/lib/components/forms/TextInput";
import styles from "@/lib/components/forms/shared/Form.module.scss";

export default function ProfileInformation() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">Links</p>

			<TextInput
				name="linkedin"
				labelClass={styles.label}
				labelText="LinkedIn Profile"
				inputClass={styles.input}
				containerClass="flex flex-col w-full"
				isRequired={false}
				type="url"
				placeholder="https://"
			/>
			<TextInput
				name="github"
				labelClass={styles.label}
				labelText="GitHub Profile"
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
