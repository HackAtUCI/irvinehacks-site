import Link from "next/link";
import Image from "next/image";

import getUserIdentity from "@/lib/utils/getUserIdentity";

import cityBackground from "@/assets/backgrounds/alt_illus_moonless.png";

async function ApplicationsClosed() {
	const identity = await getUserIdentity();

	return (
		<div className="rounded-2xl p-10 text-white text-display bg-[var(--color-blue)] text-center w-8/12 max-[800px]:w-9/12 max-[400px]:w-11/12">
			<h1 className="font-display text-pink text-2xl md:text-4xl lg:text-5xl p-10 max-[800px]:p-0">
				Applications for IrvineHacks 2026 closed on February 13th.
			</h1>
			<Image
				src={cityBackground}
				alt="Background image"
				quality={100}
				fill
				sizes="100vh"
				style={{ objectFit: "cover", zIndex: -1 }} // cover ensures it covers the area and z-index places it behind content
				priority
			/>
			<hr className="my-10 w-full h-0.5 bg-blue/40" />
			{identity.uid === null && (
				<p className="text-lg">
					If you already applied, please{" "}
					<Link href="/login" className="text-pink underline font-semibold">
						log in
					</Link>{" "}
					to visit your applicant portal.
				</p>
			)}
			<p className="text-lg">
				If you have any other questions or concerns, feel free to contact us at{" "}
				<a
					href="mailto:hack@uci.edu"
					className="text-pink underline font-semibold"
				>
					hack@uci.edu
				</a>
				.
			</p>
		</div>
	);
}

export default ApplicationsClosed;
