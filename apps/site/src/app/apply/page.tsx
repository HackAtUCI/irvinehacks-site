import Form from "./sections/Form/Form";
import Title from "./sections/Title/Title";

export const revalidate = 60;

export default function Apply() {
	return (
		<div className="flex flex-col items-center gap-10 my-32">
			<Title />
			<Form />
		</div>
    )
}
