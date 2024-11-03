import Button from "@/lib/components/Button/Button";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getResources } from "./getResources";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Resources | IrvineHacks 2024",
};

export default async function Resources() {
	if (process.env.MAINTENANCE_MODE_RESOURCES) {
		redirect("/");
	}

	const resources = await getResources();

	return (
		<>
			<section className="h-full w-full mb-12">
				<div className="my-36">
					<h1 className="font-display text-4xl md:text-5xl font-bold mb-2 text-center">
						Resources
					</h1>
				</div>
				<div className="mb-40 mx-4 ">
					{resources.order.map(
						({ _id, iconUrl, title, description, resources }, i) => (
							<div
								key={_id}
								className="max-w-5xl w-full mx-auto mb-12 bg-[var(--color-white)] text-[#2F1C00] p-12 rounded-2xl lg:grid lg:gap-20 lg:grid-cols-2 lg:items-center"
							>
								<div>
									<div className="flex gap-2 lg:flex-col">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img className="w-8 h-auto lg:w-16" src={iconUrl} alt="" />
										<h2 className="text-2xl font-bold">{title}</h2>
									</div>
									<p>{description}</p>
								</div>
								<div className="flex flex-col gap-3 lg:gap-4">
									{resources.map(({ _id, title, link }) => (
										<Button
											key={_id}
											text={title}
											href={link}
											className="w-[100%!important] text-center"
											// color={i % 2 === 0 ? "light" : "dark"}
										/>
									))}
								</div>
							</div>
						),
					)}
				</div>
			</section>
		</>
	);
}
