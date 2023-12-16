"use client";

import { FormEvent, PropsWithChildren, useState } from "react";

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
			className={validated ? "validated" : ""}
			// validated={validated}
			{...props}
		/>
	);
}

export default ValidatingForm;
