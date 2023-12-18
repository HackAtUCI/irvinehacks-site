"use client";

import { FormEvent, PropsWithChildren, useState } from "react";

import styles from "./ValidatingForm.module.scss";

interface FormProps {
	action?: string;
	method?: string;
}

function ValidatingForm(props: PropsWithChildren<FormProps>) {
	const [validated, setValidated] = useState<boolean>(false);

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		const form = event.currentTarget;
		if (!form.checkValidity()) {
			// prevent submission to display validation feedback
			event.preventDefault();
		}
		setValidated(true);
	};

	return (
		<form
			onSubmit={handleSubmit}
			noValidate // use custom validation feedback
			className={validated ? styles.validated : styles.notYetValidated}
			// validated={validated}
			{...props}
		/>
	);
}

export default ValidatingForm;
