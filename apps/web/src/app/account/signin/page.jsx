import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { SITE_NAME } from "@/config/site";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      setError("Incorrect email or password. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0C0D0F] p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md bg-[#1A1A1E] border border-[#27272A] rounded-2xl p-8"
      >
        <h1 className="mb-2 text-center text-3xl font-semibold text-white font-poppins">
          Welcome to {SITE_NAME}
        </h1>
        <p className="mb-8 text-center text-sm text-[#8B8B90]">
          Sign in to continue
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F4F4F5]">
              Email
            </label>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-[#1E1E1F] text-white placeholder-[#555555] border border-[#242424] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] focus:border-[#7A5AF8] transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F4F4F5]">
              Password
            </label>
            <input
              required
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1E1E1F] text-white placeholder-[#555555] border border-[#242424] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] focus:border-[#7A5AF8] transition-all"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-[#FF5656] bg-opacity-10 border border-[#FF5656] p-3 text-sm text-[#FF5656]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white px-4 py-3 rounded-lg font-poppins font-semibold text-sm hover:from-[#6D4CE5] hover:to-[#8B5CF6] active:from-[#5B3FD4] active:to-[#7C3AED] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center text-sm text-[#8B8B90]">
            Don't have an account?{" "}
            <a
              href="/account/signup"
              className="text-[#7A5AF8] hover:text-[#9F7AEA] font-medium"
            >
              Sign up
            </a>
          </p>
        </div>
      </form>

      <style jsx>{`
        .font-poppins {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
}
