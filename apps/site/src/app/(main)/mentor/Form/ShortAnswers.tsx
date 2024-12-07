import Textfield from "@/lib/components/forms/Textfield";
import styles from "@/lib/components/forms/shared/Form.module.scss";

export default function ShortAnswers() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">
				Profile Information
			</p>
			<Textfield
				name="mentor_previous_experience"
				labelClass={styles.label}
				labelText="Have you participated or mentored at a hackathon before? If so, please list which ones. e.g. Hack at UCI 2024 (Hacker), ZotHacks 2024 (Mentor)"
				inputClass="text-[var(--color-black)] bg-[#E1E1E1] p-3 h-48 resize-none rounded-xl"
				containerClass="flex flex-col w-full"
				isRequired={false}
			/>
			<Textfield
				name="mentor_interest"
				labelClass={styles.label}
				labelText="Why are you interested in being a mentor for IrvineHacks 2025? (100+ words recommended)"
				inputClass="text-[var(--color-black)] bg-[#E1E1E1] p-3 h-48 resize-none rounded-xl"
				containerClass="flex flex-col w-full"
				isRequired={true}
			/>
			<Textfield
				name="mentor_team_help"
				labelClass={styles.label}
				labelText="How would you go about helping a team that is struggling with a bug? How would you go about helping a team that is struggling to work together?"
				inputClass="text-[var(--color-black)] bg-[#E1E1E1] p-3 h-48 resize-none rounded-xl"
				containerClass="flex flex-col w-full"
				isRequired={true}
			/>
		</div>
	);
}
