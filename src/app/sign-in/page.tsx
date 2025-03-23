import { SignInForm } from "@snipextt/wacht";

export default function SignIn() {
	return (
		<div className="flex w-full h-[70vh] items-center justify-center">
			<SignInForm signUpUrl="/sign-up" />
		</div>
	);
}
