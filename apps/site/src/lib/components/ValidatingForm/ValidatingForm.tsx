"use client";

import { FormEvent, PropsWithChildren, useState } from "react";

import styles from "./ValidatingForm.module.scss";

interface FormProps {
	action?: string;
	method?: string;
}

function ValidatingForm(props: PropsWithChildren<FormProps>) {
	const [validated, setValidated] = useState<boolean>(false);
	const [isClickable, setIsClickable] = useState<boolean>(true);

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		const form = event.currentTarget;
		if (!form.checkValidity()) {
			// prevent submission to display validation feedback
			event.preventDefault();
		} else {
			setIsClickable(false);
		}
		setValidated(true);
	};

	return (
		<form
			onSubmit={handleSubmit}
			noValidate // use custom validation feedback
			className={`${
				validated ? styles.validated : styles.notYetValidated
			} ${isClickable ? "" : styles.unclickable}`}
			// validated={validated}
			{...props}
		/>
	);
}

export default ValidatingForm;
