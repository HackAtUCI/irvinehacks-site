import styles from "./Form.module.scss";
import BasicInformation from "./BasicInformation";

export default function Form() {
    return(
        <form className={`${styles.form} text-[#000000] w-8/12 flex flex-col items-center py-12`}>
            <BasicInformation />
        </form>
    )
}