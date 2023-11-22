import Stand from "./Stand";
import stand1 from "./stand-1.png";
import stand2 from "./stand-2.png";

const MentorVolunteer = () => {
	return (
		<div className="grid max-w-lg lg:max-w-none lg:grid-cols-[repeat(2,450px)] lg:items-stretch justify-center m-auto gap-x-8 gap-y-12 mt-24">
			<Stand
				imageSrc={stand1}
				header="Apply to be a Mentor"
				description="Interested in inspiring the next generation of developers? Our mentors are vital to making IrvineHacks 2024 successful and enjoyable for our hackers."
				buttonText="Mentor Application"
				buttonHref="google.com"
			/>
			<Stand
				imageSrc={stand2}
				header="Become a Volunteer"
				description="Want a peek behind the scenes? Join our team of event volunteers that make IrvineHacks run as smoothly as possible! Get access to all the free food and all our hackathon swag."
				buttonText="Volunteer Form"
				buttonHref="google.com"
			/>
		</div>
	);
};

export default MentorVolunteer;
