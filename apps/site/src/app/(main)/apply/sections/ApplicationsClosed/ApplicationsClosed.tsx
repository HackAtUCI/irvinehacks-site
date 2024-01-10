import Link from "next/link";

function ApplicationsClosed() {
	return (
		<div className="rounded-2xl p-10 text-display text-[#432810] bg-white text-center w-8/12 max-[800px]:w-9/12 max-[400px]:w-11/12">
			<h1 className="text-4xl p-10">
				<p>Applications for IrvineHacks 2024 were closed on January 14th.</p>
			</h1>
			<hr className="mt-5 w-full h-0.5 bg-[#432810]" />
			<p className="pt-10 text-lg">
				If you already applied, please{" "}
				<Link href="/login" className="text-blue-600 underline">
					log in
				</Link>{" "}
				to visit your applicant portal.
			</p>
			<p className="text-lg">
				If you have any other questions or concerns, feel free to contact us at{" "}
				<a href="mailto:hack@uci.edu" className="text-blue-600 underline">
					hack@uci.edu
				</a>
				.
			</p>
		</div>
	);
}

export default ApplicationsClosed;
