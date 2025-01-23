export default function ResourceDescription({
	description,
}: {
	description: string;
}) {
	return <h1 className="mb-8 font-body text-xl md:text-2xl">{description}</h1>;
}
