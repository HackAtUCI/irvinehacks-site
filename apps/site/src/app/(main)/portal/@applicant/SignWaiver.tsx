import Button from "@/lib/components/Button/Button";

function SignWaiver() {
	return (
		<div>
			<h3 className="text-3xl my-4">Waiver</h3>
			<p>
				In order to attend IrvineHacks 2024, all participants must complete the
				Participation Waiver and review the Code of Conduct. The button below
				will take you to a DocuSign form to sign the waiver. After signing the
				waiver, please return to this Portal to confirm your attendance.
			</p>
			<Button
				text="Sign Waiver to attend IrvineHacks 2024"
				href="/api/user/waiver"
			/>
		</div>
	);
}

export default SignWaiver;
