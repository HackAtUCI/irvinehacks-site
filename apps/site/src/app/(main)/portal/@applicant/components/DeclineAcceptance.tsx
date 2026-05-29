"use client";

const confirmationMessage =
	"Are you sure? This will void your application and you will no longer be considered for IrvineHacks 2026.";

export default function DeclineAcceptance() {
	return (
		<div className="mt-6 text-[var(--color-white)]">
			<p className="text-xs sm:text-sm md:text-base text-white/80">
				Plans changed? You can let us know if you are no longer interested in
				attending.
			</p>
			<form
				method="post"
				action="/api/user/decline-acceptance"
				onSubmit={(event) => {
					if (!confirm(confirmationMessage)) {
						event.preventDefault();
					}
				}}
				className="mt-1"
			>
				<button
					type="submit"
					className="text-xs sm:text-sm md:text-base text-white/80 underline underline-offset-4 hover:text-white"
				>
					I am no longer interested in attending
				</button>
			</form>
		</div>
	);
}
