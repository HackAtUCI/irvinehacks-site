import ConfirmationDetails from "./components/ConfirmationDetails/ConfirmationDetails";
import Title from "./components/Title/Title";

export default function ApplyConfirm() {
	return (
		<div className="flex flex-col items-center gap-10 my-32">
			<Title />
			<ConfirmationDetails />
		</div>
	);
}
