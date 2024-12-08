import ApplicationFlow from "@/lib/components/forms/shared/ApplicationFlow";
import HackerForm from "./Form/HackerForm";

export const revalidate = 60;

export default async function Apply({
	searchParams,
}: {
	searchParams?: {
		prefaceAccepted?: string;
	};
}) {
	return (
		<ApplicationFlow
			searchParams={searchParams}
			applicationType="Hacker"
			continueHREF="/apply"
			isHacker={true}
		>
			<HackerForm />
		</ApplicationFlow>
	);
}
