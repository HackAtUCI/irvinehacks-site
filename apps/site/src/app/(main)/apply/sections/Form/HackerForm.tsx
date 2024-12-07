import AgeInformation from "./AgeInformation";
import BasicInformation from "./BasicInformation";
import Form from "./Form";
import ProfileInformation from "./ProfileInformation";
import ResumeInformation from "./ResumeInformation";
import SchoolInformation from "./SchoolInformation";

export default function HackerForm() {
	return (
		<Form>
			<BasicInformation />
			<SchoolInformation />
			<ProfileInformation />
			<ResumeInformation />
			<AgeInformation />
		</Form>
	);
}
