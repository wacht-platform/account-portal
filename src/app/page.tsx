import { SignedInAccounts } from "@wacht/nextjs";

export default function Home() {
  return (
    <div className="flex w-full h-[90vh] items-center justify-center">
      <SignedInAccounts />
    </div>
  );
}
