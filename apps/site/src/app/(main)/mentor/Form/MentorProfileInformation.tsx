import TextInput from "@/lib/components/forms/TextInput";

export default function MentorProfileInformation({
	hidden,
}: {
	hidden: boolean;
}) {
	return (
		<div className={`${hidden && "hidden"} flex flex-col gap-5 w-11/12`}>
			<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">Links</p>

			<TextInput
				name="linkedin"
				labelText="LinkedIn Profile"
				containerClass="flex flex-col w-full"
				isRequired={false}
				type="url"
				placeholder="https://"
			/>
			<TextInput
				name="github"
				labelText="GitHub Profile / Portfolio"
				containerClass="flex flex-col w-full"
				isRequired={false}
				type="url"
				placeholder="https://"
			/>
			<TextInput
				name="portfolio"
				labelText="Personal Website"
				containerClass="flex flex-col w-full"
				isRequired={false}
				type="url"
				placeholder="https://"
			/>
		</div>
	);
}
