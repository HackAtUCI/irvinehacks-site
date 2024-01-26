"use client";

import { PropsWithChildren, useRef } from "react";

import Scene from "@/components/canvas/Scene";

const SceneLayout = ({ children }: PropsWithChildren) => {
	const ref = useRef<HTMLDivElement>(null);

	return (
		<div
			ref={ref}
			style={{
				position: "relative",
				width: " 100%",
				height: "100%",
				overflow: "hidden",
				touchAction: "auto",
			}}
		>
			{children}
			{/* Canvas wrapper component defined as a child 
			to allow for compatibilty as a client component in layout.tsx
			*/}
			<Scene
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					pointerEvents: "none",
				}}
				eventSource={ref}
				eventPrefix="client"
			/>
		</div>
	);
};

export default SceneLayout;
