import TextInput from "@/lib/components/forms/TextInput";

export default function ProfileInformation() {
	return (
		<div className="flex flex-col gap-5 w-11/12">
			<p className="text-4xl m-0 font-bold max-[700px]:text-3xl">
				Profile Information
			</p>
			<div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
				<TextInput
					name="linkedin"
					labelText="LinkedIn"
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={false}
					type="url"
					placeholder="https://"
				/>
				<TextInput
					name="portfolio"
					labelText="Portfolio (Github, website, etc.)"
					containerClass="flex flex-col w-6/12 max-[1000px]:w-full"
					isRequired={false}
					type="url"
					placeholder="https://"
				/>
			</div>
			{/*
			TODO Add SAQs here using Textfield
			*/}
		</div>
	);
}
