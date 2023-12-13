import ShiftingCountdown from "./components/ShiftingCountdown/ShiftingCountdown";

export const revalidate = 60;

export default function Schedule() {
	return (
		<>
			<section className="h-full w-full">
				<div className="m-36">
					<ShiftingCountdown />
				</div>
				<div className="h-96 flex justify-center align-middle">
					Placeholder for Schedule
				</div>
			</section>
		</>
	);
}
