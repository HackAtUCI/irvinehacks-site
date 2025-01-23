import ResourceCategory from "./ResourceCategory";
import ResourceDescription from "./ResourceDescription";
import ResourceItem from "./ResourceItem";
import { getResources } from "../getResources";

export default async function ResourceSection() {
	const resources = await getResources();

	return (
		<>
			{resources.order.map(
				({ _id, iconUrl, title, description, resources }) => (
					<div
						key={_id}
						className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 justify-center items-center lg:pr-[3.25vw]"
					>
						<ResourceCategory iconUrl={iconUrl} title={title} />
						<div className="w-full max-w-5xl bg-black p-12 grow-[2] mb-12 border-[5px] border-white shadow-[9px_9px_0px_1px_#ffffff] md:col-span-2 select-none">
							<ResourceDescription description={description} />
							<div className="overflow-y-auto h-[210px] xl:h-[250px] pb-[9px]">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
									{resources.map(({ _id, resourceIconUrl, title, link }) => (
										<ResourceItem
											key={_id}
											resourceIconUrl={resourceIconUrl}
											title={title}
											link={link}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				),
			)}
		</>
	);
}
