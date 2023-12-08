"use client";

import styles from "./Form.module.scss";
import { useState } from 'react';
import SingleSelect from "../Components/SingleSelect";
import PasswordEye from "../Components/PasswordEye";

declare namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }

const pronouns = [
	{value: "she", text: "She/her/hers"},
	{value: "he", text: "He/him/his"},
    {value: "they", text: "They/them/theirs"},
    {value: "ze", text: "Ze/zir/zirs"},
    {value: "other", text: "Other:"},
];

const ethnicity = [
	{value: "American", text: "American Indian or Alaskan"},
	{value: "Asian", text: "Asian or Pacific Islander"},
    {value: "Black", text: "Black or African American"},
    {value: "Hispanic", text: "Hispanic"},
    {value: "White", text: "White or Caucasian"},
    {value: "Two-or-more", text: "Two or more races"},
    {value: "Prefer not to answer", text: "Prefer not to answer"},
    {value: "other", text: "Other:"}
]

export default function BasicInformation() {
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const handleChangePassword = () => {
        setPasswordVisible(!passwordVisible)
    }
    
    const handleChangeConfirmPassword = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible)
    }

    return(
        <div className="flex flex-col gap-5 w-11/12">
            <p className="text-4xl m-0 font-bold text-center max-[700px]:text-3xl">Basic Information</p>

            <div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
                <div className="flex flex-col w-6/12 max-[1000px]:w-full">
                    <label className={`${styles.label}`} htmlFor="first-name">First Name <span className="text-[#FF2222]">*</span></label>
                    <input className={`${styles.input}`} type="text" name="first-name" required/>
                </div>
                <div className="flex flex-col w-6/12 max-[1000px]:w-full">
                    <label className={`${styles.label}`} htmlFor="last-name">Last Name <span className="text-[#FF2222]">*</span></label>
                    <input className={`${styles.input}`} type="text" name="last-name" required/>
                </div>
            </div>

            <div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
                <div className="flex flex-col w-full">
                    <label className={`${styles.label}`} htmlFor="email">Email <span className="text-[#FF2222]">*</span></label>
                    <input className={`${styles.input}`} type="email" name="email" required/>
                </div>
            </div>

            <div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
                <div className="flex flex-col w-6/12 max-[1000px]:w-full">
                    <label className={`${styles.label}`} htmlFor="password">Password <span className="text-[#FF2222]">*</span></label>
                    <div className="w-full flex items-center gap-3">
                        <input
                        className={`${styles.input} w-full`} 
                        type={passwordVisible ? "text" : "password"}
                        name="password" 
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        title="One number, uppercase, and lowercase letter; at least 8 or more characters"/>
                        <PasswordEye visible={passwordVisible} handler={handleChangePassword}/>
                    </div>
                    <small className="text-[#676767] m-0 text-sm">At least 8 characters with one number, one uppercase, and one lowercase letter</small>
                </div>
                <div className="flex flex-col w-6/12 max-[1000px]:w-full">
                    <label className={`${styles.label}`} htmlFor="confirm-password">Confirm Password <span className="text-[#FF2222]">*</span></label>
                    <div className="w-full flex items-center gap-3">
                        <input 
                        className={`${styles.input} w-full`} 
                        type={confirmPasswordVisible ? "text" : "password"}
                        name="confirm-password" 
                        required />
                        <PasswordEye visible={confirmPasswordVisible} handler={handleChangeConfirmPassword}/>
                    </div>
                </div>    
            </div>

            <div className="flex gap-5 w-full max-[1000px]:flex-col max-[1000px]:items-center">
                <div className="flex flex-col w-6/12 max-[1000px]:w-full">
                    <SingleSelect IdentifierID="gender-identifier" name="gender" labelText="Gender" values={pronouns} />
                </div>
                <div className="flex flex-col w-6/12 max-[1000px]:w-full">
                    <SingleSelect IdentifierID="ethnicity-identifier" name="ethnicity" labelText="Race / Ethnicity" values={ethnicity} />
                </div>
            </div>
        </div>
    )
}