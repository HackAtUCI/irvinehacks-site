import Form from "./sections/Form/Form";
import Title from "./sections/Title/Title";

export const revalidate = 60;

export default function Apply() {
	// Show landing section only if still in maintenance,
	// otherwise show the rest of the sections
	return (
		<div className="flex flex-col items-center gap-10 mt-10 mb-10">
			<Title />
			<Form />
		</div>
    )
}
