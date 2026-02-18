/* eslint-disable @next/next/no-img-element */
import { getPartners } from "./getPartners";
import { client } from "@/lib/sanity/client";
import imageUrlBuilder from "@sanity/image-url";

import NeonSectionFrame from "@/assets/images/neon-section-frame.svg";

import styles from "./Partners.module.scss";

const builder = imageUrlBuilder(client);

export default async function Partners() {
	const { partners } = await getPartners();

	return (
		<section className="container py-24 relative mx-auto w-full">
			<h2 className="text-center text-2xl sm:text-4xl lg:text-[3rem] font-display text-pink mb-4 lg:-mb-4">
				Partners
			</h2>

			<div
				className={styles.partnersContainer}
				style={
					{
						"--bg-image": `url(${NeonSectionFrame.src})`,
					} as React.CSSProperties
				}
			>
				<div
					style={{
						paddingLeft: "clamp(2.25rem, 8vw, 4rem)",
						paddingRight: "clamp(2.25rem, 8vw, 4rem)",
						paddingTop: "clamp(1.25rem, 2rem, 5.5rem)",
					}}
					className="pb-16 lg:pb-64"
				>
					<div className="flex flex-wrap mt-8 xl:mb-20 gap-8 xl:gap-16 items-center justify-center">
						{partners.map(({ _key, name, url, logo }) => (
							<a
								key={_key}
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className={`${styles.partnerItem} transition-transform hover:scale-105`}
							>
								<div className={styles.partnerLogos}>
									<img
										src={builder.image(logo).format("webp").url()}
										alt={`${name} logo`}
										className="max-w-full max-h-full object-contain"
									/>
								</div>
							</a>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
