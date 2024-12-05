import Button from "@/lib/components/Button/Button";

export default function SignWaiver() {
	return (
		<div className="mt-6 md:mt-12">
			<Button
				text="Return to Homepage"
				href="/"
				isLightVersion={true}
				className="text-xs sm:text-base md:text-4xl"
			/>
		</div>
	);
}
