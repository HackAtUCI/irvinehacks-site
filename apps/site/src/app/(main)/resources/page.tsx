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
			<section className="w-full h-full mb-12">
				<div className="my-36 text-center">
					<h1 className="mb-2 font-display font-bold text-4xl md:text-5xl">
						Resources
					</h1>
				</div>
				<div className="mx-4 mb-40">
					{resources.order.map(
						({ _id, iconUrl, title, description, resources }) => (
							<div
								key={_id}
								className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 justify-center items-center lg:pr-[3.25vw]"
							>
								<div className="grow basis-0 select-none pointer-events-none">
									<img
										className="mx-auto h-auto w-8 md:w-80"
										src={iconUrl}
										alt={title}
									/>
									<div className="align-center justify-items-center">
										<div className="top-1 left-1 w-full h-full bg-white " />
										<h2 className="border-solid border-white border-[3px] bg-black px-10 py-[0.7rem] font-display text-center font-bold text-3xl text-[calc(13px_+_1vw)] shadow-[8px_8px_0px_1px_#ffffff]">
											{title}
										</h2>
									</div>
								</div>
								<div className="w-full max-w-5xl bg-black p-12 grow-[2] mb-12 border-[5px] border-white shadow-[9px_9px_0px_1px_#ffffff] md:col-span-2 select-none">
									<h1 className="mb-8 font-body text-xl md:text-2xl">
										{description}
									</h1>
									<div className="overflow-y-auto h-[210px] xl:h-[250px] pb-[9px]">
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
											{resources.map(
												({ _id, resourceIconUrl, title, link }) => (
													<a
														key={_id}
														href={link}
														target="_blank"
														className="flex flex-col items-center justify-center bg-black text-white border border-[3px] border-white transition-all duration-300 hover:bg-white hover:text-black hover:border-black hover:shadow-[9px_9px_0px_1px_#ffffff] w-full h-[200px] xl:h-[240px] flex-grow"
													>
														<div className="h-full py-6 xl:p-6">
															<img
																className="pointer-events-none  w-[90px] h-[90px] xl:w-[130px] xl:h-[130px]"
																src={resourceIconUrl}
																alt={title}
															/>
														</div>
														<div className="flex flex-wrap text-center px-2">
															<p className="text-md lg:text-lg font-medium">
																{title}
															</p>
														</div>
													</a>
												),
											)}
										</div>
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
