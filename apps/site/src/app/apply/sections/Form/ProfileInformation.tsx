import styles from "./Form.module.scss";

export default function ProfileInformation() {
    return(
        <div className="flex flex-col gap-5 w-11/12">
            <p className="text-4xl m-0 font-bold">Profile Information</p>

            <div className="flex gap-5 w-full">
                <div className="flex flex-col w-6/12">
                    <label className={`${styles.label}`} htmlFor="linkedin">LinkedIn</label>
                    <input className={`${styles.input}`} type="url" name="linkedin" placeholder="http://" />
                </div>
                <div className="flex flex-col w-6/12">
                    <label className={`${styles.label}`} htmlFor="portfolio">Portfolio (Github, website, etc.)</label>
                    <input className={`${styles.input}`} type="url" name="portfolio" placeholder="http://" />
                </div>
            </div>

            <div className="flex gap-5 w-full">
                <div className="flex flex-col w-full">
                    <label className={`${styles.label} mt-7`} htmlFor="linkedin">Why is collaboration important to being a programmer or technologist, and what does it mean to you? (150 words) <span className="text-[#FF2222]">*</span></label>
                    <textarea className="bg-[#E1E1E1] p-3 h-48 resize-none" />
                </div>
            </div>

            <div className="flex gap-5 w-full">
                <div className="flex flex-col w-full">
                    <label className={`${styles.label} mt-7`} htmlFor="linkedin">If you could do any job, what would it be? (ex. Youtuber, Body Builder, etc.) (100 words) <span className="text-[#FF2222]">*</span></label>
                    <textarea className="bg-[#E1E1E1] p-3 h-48 resize-none" />
                </div>
            </div>

        </div>
    )
}