
import ShiftingCountdown from "./components/ShiftingCountdown/ShiftingCountdown"

export const revalidate = 60;


export default function Schedule() {



	return (
		<>
            <section className="h-full w-full">
                <div className="h-1/3">
                    <ShiftingCountdown/>
                </div>
                <div className="h-2/3 flex justify-center align-middle">
                    Placeholder for Schedule
                </div>

            </section>
        </>
	)
}