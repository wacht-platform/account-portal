import { SignUpForm } from "@snipextt/wacht-js";

export default function SignUp() {
	return (
		<div className="flex w-full h-[90vh] items-center justify-center">
			<SignUpForm signInUrl="/sign-in" />
		</div>
	);
}
