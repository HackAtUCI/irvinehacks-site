import Button from "@/lib/components/Button/Button";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getResources } from "./getResources";

export const revalidate = 60;

export const metadata: Metadata = {
	title: "Resources | IrvineHacks 2025",
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
				<div className="mb-40 mx-4">
					{resources.order.map(
						({ _id, iconUrl, title, description, resources }) => (
							<div
								key={_id}
								className="flex flex-col md:flex-row justify-center align-center justify-items-center"
							>
								<div className="grow basis-0">
									<img
										className="w-8 mx-auto h-auto lg:w-80"
										src={iconUrl}
										alt=""
									/>
									<div className="s align-center justify-items-center">
										<div className="top-1 left-1 bg-white w-full h-full" />
										<h2 className="shadow-[8px_8px_0px_1px_#ffffff] font-display text-center font-bold text-3xl bg-black text-[calc(13px_+_1vw)] px-10 py-[0.7rem] border-[3px] border-solid border-white">
											{title}
										</h2>
									</div>
								</div>
								<div
									className="max-w-5xl w-full grow-[2] basis-0
									 mx-auto mb-12 bg-[var(--color-white)] text-[#2F1C00] p-12 rounded-2xl lg:grid lg:gap-20 lg:grid-cols-2 lg:items-center"
								>
									<div>
										<div className="flex gap-2 lg:flex-col">
											{/* eslint-disable-next-line @next/next/no-img-element */}
										</div>
									</div>
									<div className="flex flex-col gap-3 lg:gap-4">
										<p>{description}</p>
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
							</div>
						),
					)}
				</div>
			</section>
		</>
	);
}
