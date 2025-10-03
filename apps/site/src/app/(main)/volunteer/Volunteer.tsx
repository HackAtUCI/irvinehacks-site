import ApplicationFlow from "@/lib/components/forms/shared/ApplicationFlow";
import VolunteerForm from "./VolunteerForm";

export const revalidate = 60;

export default async function Volunteer({
	searchParams,
}: {
	searchParams: {
		prefaceAccepted?: string;
	};
}) {
	return (
		<ApplicationFlow
			prefaceAccepted={searchParams.prefaceAccepted}
			applicationType="Volunteer"
			applicationURL="/volunteer"
		>
			<VolunteerForm />
		</ApplicationFlow>
	);
}
