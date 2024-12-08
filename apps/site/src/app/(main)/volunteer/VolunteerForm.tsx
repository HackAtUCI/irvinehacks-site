import BasicInformation from "@/lib/components/forms/shared/BasicInformation";
import AgeInformation from "@/lib/components/forms/shared/AgeInformation";
import SchoolInformation from "@/lib/components/forms/shared/SchoolInformation";
import Form from "@/lib/components/forms/shared/Form";

import ShiftAvailability from "./components/ShiftAvailability";
import VolunteerFRQ from "./components/VolunteerFRQ";
import ExtraQuestions from "./components/ExtraQuestions";

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
