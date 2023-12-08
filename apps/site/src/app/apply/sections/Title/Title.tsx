import styles from "./Title.module.scss";

export default function Title() {
    // console.log(styles.title)
    return(
        <>
            <h1 className={`${styles.title} font-display text-[#fffce2] text-8xl text-center max-[500px]:text-7xl`}>Apply</h1>
            <h2 className="text-[#fffce2] text-4xl font-bold mt-5 mb-5 text-center max-[900px]:text-3xl max-[500px]:text-2xl ml-5 mr-5">Applications close on January 30th, 11:59PM PST</h2>
        </>
    )
}