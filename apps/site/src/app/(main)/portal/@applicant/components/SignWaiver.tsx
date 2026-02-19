import Button from "@/lib/components/Button/Button";
import { Decision } from "@/lib/userRecord";

interface SignWaiverProps {
	decision: Decision;
	waitlistOpen: boolean;
}

function SignWaiver({ decision, waitlistOpen }: SignWaiverProps) {
	return (
		<div className="mt-4 md:mt-10 text-[var(--color-white)]">
			<h3 className="font-bold font-display mb-[9px] md:mb-[20px] text-[0.9375rem] sm:text-2xl md:text-[2.5rem] md:leading-10">
				Waiver
			</h3>
			<p className="font-sans font-normal md:text-2xl">
				In order to attend IrvineHacks 2026, all participants must complete the
				Participation Waiver and review the Code of Conduct. The button below
				will take you to a DropboxSign form to sign the waiver.{" "}
				{(decision !== Decision.Waitlisted ||
					(decision === Decision.Waitlisted && waitlistOpen)) && (
					<span>
						After signing the waiver, please return to this Portal to confirm
						your attendance.
					</span>
				)}
			</p>
			<div className="mt-6 md:mt-12">
				<Button
					text="Sign Waiver to attend IrvineHacks 2026"
					href="https://app.hellosign.com/s/1C2DkqYe"
					newWindow={true}
					usePrefetch={false}
					isLightVersion={true}
					className="!bg-pink !w-full md:!w-[875px] !font-sans !font-medium md:text-3xl !leading-none !tracking-normal !text-center"
				/>
			</div>
			<p className="text-xl w-full text-center mt-2 text-yellow-500">
				If you have signed the waiver and received a confirmation, you do not
				have to sign the waiver again.
			</p>
		</div>
	);
}

export default SignWaiver;
