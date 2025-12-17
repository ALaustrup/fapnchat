import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0C0D0F] p-4">
      <div className="w-full max-w-md bg-[#1A1A1E] border border-[#27272A] rounded-2xl p-8">
        <h1 className="mb-8 text-center text-3xl font-semibold text-white font-poppins">
          Sign Out
        </h1>

        <button
          onClick={handleSignOut}
          className="w-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white px-4 py-3 rounded-lg font-poppins font-semibold text-sm hover:from-[#6D4CE5] hover:to-[#8B5CF6] active:from-[#5B3FD4] active:to-[#7C3AED] transition-all duration-200"
        >
          Sign Out
        </button>
      </div>

      <style jsx>{`
        .font-poppins {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
}
