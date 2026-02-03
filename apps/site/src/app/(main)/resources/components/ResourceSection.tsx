import clsx from "clsx";
import ResourceCategory from "./ResourceCategory";
import ResourceDescription from "./ResourceDescription";
import ResourceItem from "./ResourceItem";
import ResourceHeader from "./ResourceHeader"; 
import { getResources } from "../getResources";
import styles from "./ResourceSection.module.scss";

export default async function ResourceSection() {
	const resources = await getResources();

	return (
		<>
			{resources.order.map(
				({ _id, iconUrl, title, description, resources }) => (
					<>
						<div className="flex flex-col justify-center items-center">
						<div className="bg-gradient-to-b from-[#00FFFF80] via-[#170F5180] to-[#00FFFF80] w-full max-w-5xl p-5 sm:p-7 grow-[2] mb-12 rounded-md select-none">
								<ResourceHeader
									title={title}
									description={description}
								/>
								<div className="pb-[9px]">
									<div className="block md:hidden">
										<div className="mt-2 flex flex-col gap-4">
											{resources.map(({ _id, resourceIconUrl, title, link }) => (
												<ResourceItem
													key={_id}
													title={title}
													link={link}
													isMobile={true}
												/>
											))}
										</div>
									</div>
									<div className={clsx(
											styles.scrollbar,
											"hidden md:block overflow-y-auto h-[250px] xl:h-[275px] pb-[9px] pr-4",
										)}>
										<div className="p-5 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 overflow-y-auto">
											{resources.map(({ _id, resourceIconUrl, title, link }) => (
												<ResourceItem
													key={_id}
													resourceIconUrl={resourceIconUrl}
													title={title}
													link={link}
													isMobile={false}
												/>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					</>
				),
			)}
		</>
	);
}
