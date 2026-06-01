import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f5f3ff] via-[#faf8ff] to-[#f0f4ff] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md flex flex-col items-center">
        <SignUp />
      </div>
    </div>
  );
}
