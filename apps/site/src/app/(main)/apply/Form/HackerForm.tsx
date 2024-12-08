import AgeInformation from "@/lib/components/forms/shared/AgeInformation";
import Form from "@/lib/components/forms/shared/BaseForm";
import SchoolInformation from "@/lib/components/forms/shared/SchoolInformation";
import ResumeInformation from "@/lib/components/forms/shared/ResumeInformation";

import BasicInformation from "./HackerBasicInformation";
import ProfileInformation from "./ProfileInformation";

export default function HackerForm() {
	return (
		<Form applicationType="HACKER">
			<BasicInformation />
			<SchoolInformation />
			<ProfileInformation />
			<ResumeInformation />
			<AgeInformation />
		</Form>
	);
}
