import {
  NavigateToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@snipextt/wacht";

export default function Home() {
  return (
    <>
      <SignedIn>
        <nav>
          <UserButton showName={false} />
        </nav>
      </SignedIn>
      <SignedOut>
        <NavigateToSignIn />
      </SignedOut>
    </>
  );
}
