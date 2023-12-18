import ApplyConfirm from "./sections/ApplyConfirmation/ApplyConfirm";
import Form from "./sections/Form/Form";
import Title from "./sections/Title/Title";

export const revalidate = 60;

export default function Apply({
	searchParams,
}: {
	searchParams?: {
		prefaceAccepted?: string;
	};
}) {
	const applyBody =
		searchParams !== undefined &&
		searchParams?.prefaceAccepted == "true" ? (
			<>
				<Title />
				<Form />
			</>
		) : (
			<ApplyConfirm />
		);
	return (
		<div className="flex flex-col items-center gap-10 my-32">
			{applyBody}
		</div>
	);
}
