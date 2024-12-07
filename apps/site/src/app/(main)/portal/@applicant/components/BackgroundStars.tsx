import Image from "next/image";
import Stars from "@/assets/icons/background-stars.svg";

interface BackgroundStarsProps {
	className?: string;
}

const BackgroundStars: React.FC<BackgroundStarsProps> = ({
	className = "",
}) => {
	return (
		<Image
			src={Stars}
			alt="two stars in the distance"
			height={160}
			width={127}
			className={`hidden xl:block absolute pointer-events-none ${className}`}
		/>
	);
};

export default BackgroundStars;
