"use client";
import {
  NavigateToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
  useNavigation,
} from "@snipextt/wacht-nextjs";

function DebugComponent() {
  const { navigate } = useNavigation();
  setTimeout(() => {
    navigate("https://accounts.wacht.dev/sign-in");
  }, 1000);
  console.log("Navigation function available:", !!navigate);
  return null;
}

export default function Home() {
  return (
    <>
      <DebugComponent />
      <SignedIn>
        <nav>
          <UserButton showName={false} />
        </nav>
      </SignedIn>
      {/* <SignedOut>
        <NavigateToSignIn />
      </SignedOut> */}
    </>
  );
}
