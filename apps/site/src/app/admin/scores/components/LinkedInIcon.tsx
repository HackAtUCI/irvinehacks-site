import linkedinLogo from "@/assets/logos/linkedin-pink.svg";

function LinkedInIcon() {
	// Use the logo as a stencil so it takes on the parent's text color
	const mask = `url("${linkedinLogo.src}") center / contain no-repeat`;

	return (
		<span
			aria-hidden="true"
			style={{
				display: "inline-block",
				width: 20,
				height: 20,
				backgroundColor: "currentColor",
				mask,
				WebkitMask: mask,
			}}
		/>
	);
}

export default LinkedInIcon;
