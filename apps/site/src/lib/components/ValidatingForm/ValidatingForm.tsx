"use client";

import { FormEvent, PropsWithChildren, useState } from "react";
import Button from "@/lib/components/Button/Button";

import styles from "./ValidatingForm.module.scss";

interface FormProps {
	action?: string;
	method?: string;
}

function ValidatingForm(props: PropsWithChildren<FormProps>) {
	const [validated, setValidated] = useState<boolean>(false);
	const [isDisabled, setIsDisabled] = useState<boolean>(false);

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		const form = event.currentTarget;
		if (!form.checkValidity()) {
			// prevent submission to display validation feedback
			event.preventDefault();
		} else {
			setIsDisabled(true);
		}
		setValidated(true);
	};

	return (
		<form
			onSubmit={handleSubmit}
			noValidate // use custom validation feedback
			className={`bg-white p-5 md:p-10 rounded-2xl mx-5 text-black ${
				validated ? styles.validated : styles.notYetValidated
			}`}
			// validated={validated}
			{...props}
		>
			{props.children}
			<Button text="Continue" disabled={isDisabled} />
		</form>
	);
}

export default ValidatingForm;
