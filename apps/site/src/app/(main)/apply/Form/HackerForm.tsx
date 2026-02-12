import AgeInformation from "@/lib/components/forms/shared/AgeInformation";
import BaseForm from "@/lib/components/forms/shared/BaseForm";
import SchoolInformation from "@/lib/components/forms/shared/SchoolInformation";
import ResumeInformation from "@/lib/components/forms/shared/ResumeInformation";

import BasicInformation from "./HackerBasicInformation";
import ProfileInformation from "./ProfileInformation";
import ExtraQuestions from "@/lib/components/forms/shared/ExtraQuestions";

export default function HackerForm() {
	return (
		<BaseForm applicationType="Hacker" applyPath="/api/user/apply">
			<div className="w-11/12">
				<p className="text-lg">
					[Note] If you have any questions about IrvineHacks, please email{" "}
					<b>
						<span>irvinehacks2026</span>
						<span>@gmail.com</span>
					</b>
					.
				</p>
			</div>
			<AgeInformation />
			<BasicInformation />
			<SchoolInformation />
			<ExtraQuestions />
			<ProfileInformation />

			<ResumeInformation isRequired />
		</BaseForm>
	);
}
