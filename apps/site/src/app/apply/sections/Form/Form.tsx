import styles from "./Form.module.scss";
import BasicInformation from "./BasicInformation";
import AgeInformation from "./AgeInformation";
import SchoolInformation from "./SchoolInformation";
import ProfileInformation from "./ProfileInformation";
import koiLeft from "@/assets/images/koi-swim-left.png";
import koiRight from "@/assets/images/koi-swim-right.png";
import Image from "next/image";
import Button from "@/lib/components/Button/Button";

export default function Form() {
    return(
        <div className="relative w-full flex flex-col items-center">
            <Image
				src={koiLeft}
				height="250"
				alt="Koi fish"
				className={`${styles.image} absolute top-0 right-0`}
			/>
            <Image
				src={koiRight}
				height="250"
				alt="Koi fish"
				className={`${styles.image} absolute top-1/4 left-0`}
			/>
            <Image
				src={koiLeft}
				height="250"
				alt="Koi fish"
				className={`${styles.image} absolute top-1/2 right-0`}
			/>
            <Image
				src={koiRight}
				height="250"
				alt="Koi fish"
				className={`${styles.image} absolute top-3/4 left-0`}
			/>
            <form className={`${styles.form} text-[#000000] w-8/12 flex flex-col items-center py-12 gap-10 z-1 max-[800px]:w-9/12 max-[400px]:w-11/12`}>
                <BasicInformation />
                <SchoolInformation />
                <ProfileInformation />
                <AgeInformation />
				<Button
					className=""
					text="Submit Application"
				/>
            </form>
        </div>

    )
}