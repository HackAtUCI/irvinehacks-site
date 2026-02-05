import clsx from "clsx";
import Arrow from "@/assets/icons/resource-arrow.svg";
import extraBorder from "@/assets/icons/ExtraBorder.svg";

import ResourceItem from "./ResourceItem";
import ResourceHeader from "./ResourceHeader";
import ResourcePageFooter from "./ResourcePageFooter";
import { getResources } from "../getResources";
import styles from "./ResourceSection.module.scss";
import Image from "next/image";

export default async function ResourceSection() {
	const resources = await getResources();

	return (
		<>
			{resources.order.map(({ title, description, resources }) => (
				<>
					<div className="flex flex-col justify-center items-center mb-12">
						<div className="flex flex-row items-center justify-center">
							<Image
								src={extraBorder}
								alt="extra border"
								height={500}
								className={styles.leftBorder}
							/>
							<div className="bg-gradient-to-b from-[#00FFFF80] via-[#170F5180] to-[#00FFFF80] w-full max-w-[400px] md:max-w-5xl p-5 sm:p-7 grow-[2] mb-12 rounded-md select-none">
								<ResourceHeader title={title} description={description} />
								<div className="pb-[9px]">
									<div className="block md:hidden">
										<div className="mt-2 flex flex-col gap-4 items-center justify-center">
											{resources.map(({ _id, title, link }) => (
												<ResourceItem
													key={_id}
													title={title}
													link={link}
													isMobile={true}
												/>
											))}
										</div>
									</div>
									<div className="hidden md:flex flex-row items-center justify-center">
										<Image
											src={Arrow}
											alt="arrow"
											width={80}
											height={80}
											className="rotate-180"
										/>
										<div
											className={clsx(
												styles.scrollbar,
												"overflow-y-auto h-[250px] xl:h-[275px] pb-[9px] pr-4 mx-5",
											)}
										>
											<div className="p-5 w-full grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 overflow-y-auto">
												{resources.map(
													({ _id, resourceIconUrl, title, link }) => (
														<ResourceItem
															key={_id}
															resourceIconUrl={resourceIconUrl}
															title={title}
															link={link}
															isMobile={false}
														/>
													),
												)}
											</div>
										</div>
										<Image src={Arrow} alt="arrow" width={80} height={80} />
									</div>
								</div>
							</div>
							<Image
								src={extraBorder}
								alt="extra border"
								height={500}
								className={styles.rightBorder}
							/>
						</div>
					</div>
				</>
			))}
			<ResourcePageFooter />
		</>
	);
}
