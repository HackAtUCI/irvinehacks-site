import styles from "./Form.module.scss";
import DropdownSelect from "../Components/dropdownSelect";

const educationLevels = [
    {value: "first-year-undergrad", text: "First Year Undergraduate"},
    {value: "second-year-undergrad", text: "Second Year Undergraduate"},
    {value: "third-year-undergrad", text: "Third Year Undergraduate"},
    {value: "fourth-year-undergrad", text: "Fourth Year Undergraduate"},
    {value: "fifth-year-undergrad", text: "Fifth+ Year Undergraduate"},
    {value: "graduate", text: "Graduate"}
];
const universityOptions = [
    {value: "UC Irvine", text: "UC Irvine"},
    {value: "UC San Diego", text: "UC San Diego"},
    {value: "UCLA", text: "UCLA"},
    {value: "UC Berkeley", text: "UC Berkeley"},
    {value: "Cal State Long Beach", text: "Cal State Long Beach"},
    {value: "Cal State Fullerton", text: "Cal State Fullerton"},
    {value: "Cal Poly Pomona", text: "Cal Poly Pomona"},
    {value: "UC Riverside", text: "UC Riverside"},
    {value: "UC Santa Barbara", text: "UC Santa Barbara"},
    {value: "other", text: "Other"}
];

export default function SchoolInformation() {
    return(
        <div className="flex flex-col gap-5 w-11/12">
            <p className="text-4xl m-0 font-bold text-center">Education</p>

            <div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
                <div className="flex flex-col w-6/12 max-[1000px]:w-full">
                    <DropdownSelect 
                    labelStyle={`${styles.label}`} 
                    inputStyle={`${styles.input}`} 
                    name="education-level" 
                    labelText="Current Education Level" 
                    values={educationLevels} />
                </div>

                <div className="flex flex-col w-6/12 max-[1000px]:w-full">
                    <DropdownSelect 
                    labelStyle={`${styles.label}`} 
                    inputStyle={`${styles.input}`} 
                    name="school-name" 
                    labelText="School Name" 
                    values={universityOptions} />
                </div>
            </div>

            <div className="flex gap-5 w-full">
                <div className="flex flex-col w-full">
                    <label className={`${styles.label}`} htmlFor="major">What is your major? <span className="text-[#FF2222]">*</span></label>
                    <input className={`${styles.input}`} type="text" name="major" required/>
                </div>
            </div>

            <div className="flex gap-5 w-full">
                <div className="flex flex-row items-center gap-5 max-[600px]:flex-col max-[600px]:items-center max-[600px]:gap-1 max-[600px]:w-full text-center">
                    <p className={`text-lg mb-0 p-0`}>Is this your first Hacakthon? <span className="text-[#FF2222]">*</span></p>
                    <div className="flex gap-2 items-center">
                        <input type="radio" id="hack-yes" name="hack-check" value="Yes" defaultChecked={true} required/>
                        <label htmlFor="hack-yes" className="font-bold">Yes</label>
                    </div>
                    <div className="flex gap-2 items-center">
                        <input type="radio" id="hack-no" name="hack-check" value="No" required/>
                        <label htmlFor="hack-no" className="font-bold">No</label>
                    </div>
                </div>

            </div>



        </div>
    )
}