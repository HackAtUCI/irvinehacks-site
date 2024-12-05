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
	const [submitting, setSubmitting] = useState<boolean>(false);

	const { children, ...rest } = props;

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		const form = event.currentTarget;
		if (!form.checkValidity()) {
			// prevent submission to display validation feedback
			event.preventDefault();
		} else {
			setSubmitting(true);
		}
		setValidated(true);
	};

	return (
		<form
			onSubmit={handleSubmit}
			noValidate // use custom validation feedback
			className={`${
				validated ? styles.validated : styles.notYetValidated
			} flex flex-col items-center`}
			{...rest}
		>
			{children}
			<div className="w-1/3">
				<Button
					className="text-xs sm:text-base md:text-2xl"
					text="Login"
					disabled={submitting}
					isLightVersion
				/>
			</div>
		</form>
	);
}

export default ValidatingForm;
