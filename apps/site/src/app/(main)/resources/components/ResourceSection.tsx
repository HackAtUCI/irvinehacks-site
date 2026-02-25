/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Arrow from "@/assets/icons/resource-arrow.svg";
import extraBorder from "@/assets/icons/extraBorder.svg";

import ResourceItem from "./ResourceItem";
import ResourceHeader from "./ResourceHeader";
import ResourcePageFooter from "./ResourcePageFooter";
import styles from "./ResourceSection.module.scss";
import Image from "next/image";

import { useState } from "react";

const ITEMS_PER_PAGE = 3;

export default function ResourceSection({ data }: { data: any }) {
	const [pages, setPages] = useState<Record<number, number>>({});

	const setPageFor = (index: number, value: number) => {
		setPages((prev) => ({ ...prev, [index]: value }));
	};

	return (
		<>
			{data.order.map((section: any, index: number) => {
				const page = pages[index] ?? 0;
				const resources = section.resources ?? [];

				const visibleResources = resources.slice(
					page * ITEMS_PER_PAGE,
					page * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
				);

				return (
					<div
						key={section._id}
						className="flex flex-col justify-center items-center mb-12"
					>
						<div className="flex flex-row items-center justify-center">
							<Image
								src={extraBorder}
								alt="extra border"
								height={500}
								className={styles.leftBorder}
							/>

							<div className="bg-gradient-to-b from-[#00FFFF80] via-[#170F5180] to-[#00FFFF80] w-full max-w-[400px] md:max-w-5xl p-5 sm:p-7 grow-[2] mb-12 rounded-md select-none">
								<ResourceHeader
									title={section.title}
									description={section.description}
								/>

								<div className="pb-[9px]">
									{/* MOBILE */}
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

									{/* DESKTOP CAROUSEL */}
									<div className="hidden md:flex flex-row items-center justify-center">
										<Image
											src={Arrow}
											alt="previous"
											width={80}
											height={80}
											className="rotate-180 cursor-pointer"
											onClick={() => setPageFor(index, Math.max(page - 1, 0))}
										/>

										<div className="pb-[9px] pr-4 mx-5">
											<div className="p-5 w-full grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
												{visibleResources.map(
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

										<Image
											src={Arrow}
											alt="next"
											width={80}
											height={80}
											className="cursor-pointer"
											onClick={() =>
												setPageFor(
													index,
													(page + 1) * ITEMS_PER_PAGE >= resources.length
														? page
														: page + 1,
												)
											}
										/>
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
				);
			})}

			<ResourcePageFooter />
		</>
	);
}
