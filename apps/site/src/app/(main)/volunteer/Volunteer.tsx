import VolunteerForm from "../apply/sections/Form/VolunteerForm";

const Volunteer = () => {
	return (
		<div className="w-full pb-10 flex flex-col items-center gap-12 mt-32">
			<div className="font-display text-5xl font-bold">
				Apply as a Volunteer
			</div>
			<div className="font-display text-3xl text-yellow-100">
				Applications close on January 30th, 11:59PM PST
			</div>
			<div className="w-full flex justify-center pb-10">
				<VolunteerForm />
			</div>
		</div>
	);
};

export default Volunteer;
