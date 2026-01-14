import Button from "@/lib/components/Button/Button";

function SignWaiver() {
	return (
		<div className="mt-4 md:mt-10 text-[var(--color-white)]">
			<h3 className="font-bold font-display mb-[9px] md:mb-[20px] text-[0.9375rem] sm:text-2xl md:text-[2.5rem] md:leading-10">
				RSVP
			</h3>
			<p className="font-sans font-normal text-xs sm:text-base md:text-[24px] leading-[1.39] tracking-normal">
				Short description of the event. Lorem ipsum dolor sit amet, consectetur
				adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
				magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<div className="mt-6 md:mt-12">
				<Button
					text="Sign Waiver to attend IrvineHacks 2026"
					href="/api/user/waiver"
					newWindow={true}
					usePrefetch={false}
					isLightVersion={true}
					className="!bg-pink !w-full md:!w-[875px] !h-[56px] sm:!h-[80px] md:!h-[112px]"
					style={{
						fontFamily: "Lexend Giga",
						fontWeight: 500,
						fontSize: "32px",
						lineHeight: "100%",
						letterSpacing: "0%",
						textAlign: "center",
					}}
				/>
			</div>

		</div>
	);
}

export default SignWaiver;
