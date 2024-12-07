import BasicInformation from "../apply/sections/Form/BasicInformation";
import AgeInformation from "../apply/sections/Form/AgeInformation";
import SchoolInformation from "../apply/sections/Form/SchoolInformation";
import ShiftAvailability from "./components/ShiftAvailability";
import VolunteerFRQ from "./components/VolunteerFRQ";
import ExtraQuestions from "../apply/sections/Form/ExtraQuestions";
import Form from "../apply/sections/Form/Form";

export default function VolunteerForm() {
	return (
		<Form>
			<BasicInformation />
			<SchoolInformation />
			<VolunteerFRQ />
			<ShiftAvailability />
			<ExtraQuestions />
			<AgeInformation />
		</Form>
	);
}
