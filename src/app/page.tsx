"use client";
import {
  NavigateToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
  useDeployment,
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
