import styles from "./Title.module.scss";

export default function Title() {
    // console.log(styles.title)
    return(
        <>
            <h1 className={`${styles.title} text-[#fffce2] text-8xl text-center`}>Apply</h1>
            <h2 className="text-[#fffce2] text-4xl font-bold">Applications close on January 30th, 11:59PM PST</h2>
        </>
    )
}