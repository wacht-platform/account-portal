import { SocialCallback } from "@wacht/nextjs";

export default function SocialLogin() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <SocialCallback />
    </div>
  );
}
