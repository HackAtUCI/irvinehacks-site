import styles from "./Form.module.scss";

export default function BasicInformation() {
    return(
        <div className="flex flex-col gap-5 w-11/12">
            <p className="text-4xl m-0 font-bold">Basic Information</p>

            <div className="flex gap-5 w-full">
                <div className="flex flex-col w-6/12">
                    <label className={`${styles.label}`} htmlFor="first-name">First Name <span className="text-[#FF2222]">*</span></label>
                    <input className={`${styles.input}`} type="text" name="first-name" required/>
                </div>
                <div className="flex flex-col w-6/12">
                    <label className={`${styles.label}`} htmlFor="last-name">Last Name <span className="text-[#FF2222]">*</span></label>
                    <input className={`${styles.input}`} type="text" name="last-name" required/>
                </div>
            </div>

            <div className="flex gap-5 w-full">
                <div className="flex flex-col w-6/12">
                    <label className={`${styles.label}`} htmlFor="email">Email <span className="text-[#FF2222]">*</span></label>
                    <input className={`${styles.input}`} type="email" name="email" required/>
                </div>
                <div className="flex flex-col w-3/12">
                    <label className={`${styles.label}`} htmlFor="gender">Gender <span className="text-[#FF2222]">*</span></label>
                    <select className={`${styles.input}`}>
                        <option value="she">--Select--</option>
                        <option value="she">She/her/hers</option>
                        <option value="he">He/him/his</option>
                        <option value="they">They/them/theirs</option>
                        <option value="ze">Ze/zir/zirs</option>
                        <option value="other">Other:</option>
                    </select>
                </div>
                <div className="flex flex-col w-3/12">
                    <label className={`${styles.label}`} htmlFor="gender">Race / Ethnicity <span className="text-[#FF2222]">*</span></label>
                    <select className={`${styles.input}`}>
                        <option value="she">--Select--</option>
                        <option value="she">American Indian or Alaskan</option>
                        <option value="he">Asian or Pacific Islander</option>
                        <option value="they">Black or African American</option>
                        <option value="ze">Hispanic</option>
                        <option value="other">White or Caucasian</option>
                        <option value="other">Two or more races</option>
                        <option value="other">Prefer not to answer</option>
                        <option value="other">Other:</option>
                    </select>
                </div>

            </div>

            <div className="flex gap-5 w-full">
                <div className="flex flex-col w-6/12">
                    <label className={`${styles.label}`} htmlFor="password">Password <span className="text-[#FF2222]">*</span></label>
                    <input className={`${styles.input}`} type="password" name="password" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" required />
                </div>
                <div className="flex flex-col w-6/12">
                    <label className={`${styles.label}`} htmlFor="confirm-password">Confirm Password <span className="text-[#FF2222]">*</span></label>
                    <input className={`${styles.input}`} type="password" name="confirm-password" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" required />
                </div>
            
            </div>

        </div>
    )
}