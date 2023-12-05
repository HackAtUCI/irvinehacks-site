import Image from "next/image";

import lantern from "@/assets/images/lantern.png";
import React from "react";

interface LanternProps {
	width: number;
	height: number;
	className?: string;
	style?: React.CSSProperties;
}

const Lantern: React.FC<LanternProps> = ({
	width,
	height,
	className,
	style,
}) => {
	return (
		<Image
			src={lantern}
			width={width}
			height={height}
			alt="Lantern"
			className={className}
			style={style}
		/>
	);
};

export default Lantern;
