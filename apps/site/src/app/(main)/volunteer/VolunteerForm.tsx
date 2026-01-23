import BasicInformation from "./components/VolunteerBasicInformation";
import AgeInformation from "@/lib/components/forms/shared/AgeInformation";
import SchoolInformation from "@/lib/components/forms/shared/SchoolInformation";
import BaseForm from "@/lib/components/forms/shared/BaseForm";

import ShiftAvailability from "./components/ShiftAvailability";
import VolunteerFRQ from "./components/VolunteerFRQ";
import ExtraQuestions from "@/lib/components/forms/shared/ExtraQuestions";
import Textfield from "@/lib/components/forms/Textfield";

export default function VolunteerForm() {
	return (
		<BaseForm applicationType="Volunteer" applyPath="/api/user/volunteer">
			<div className="w-11/12">
				<p className="text-lg">
					[Note] If you have any questions about IrvineHacks or being a
					volunteer, please email <b>irvinehacks2026@gmail.com</b>.
				</p>
			</div>
			<AgeInformation />
			<BasicInformation />
			<ExtraQuestions />
			<SchoolInformation />

			<ShiftAvailability />
			<Textfield
				name="frq_volunteer_allergy"
				labelText="If you are tasked to serve food, do you have any allergies we should be aware of? If so, please explain the severity of each allergy."
				containerClass="w-11/12"
				isRequired={false}
			/>
			<VolunteerFRQ />
		</BaseForm>
	);
}
