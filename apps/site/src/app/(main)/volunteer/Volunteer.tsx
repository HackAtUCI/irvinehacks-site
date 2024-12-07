import VolunteerForm from "./VolunteerForm";

const Volunteer = () => {
	return (
		<div className="w-full pb-10 flex flex-col items-center gap-12 mt-32">
			<h1 className="font-display text-center text-5xl font-bold">
				Apply as a Volunteer
			</h1>
			<h2 className="font-display text-center text-3xl text-yellow-100">
				Applications close on January 10th, 11:59PM PST
			</h2>
			<div className="w-full flex justify-center pb-10">
				<VolunteerForm />
			</div>
		</div>
	);
};

export default Volunteer;
