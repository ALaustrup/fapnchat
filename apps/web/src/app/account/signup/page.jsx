import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";
import { SITE_NAME } from "@/config/site";
import { validateBirthDateForSignup } from "@/utils/ageSegmentation";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [ageValidation, setAgeValidation] = useState(null);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteOnlyMode, setInviteOnlyMode] = useState(false);
  const [inviteCodeValid, setInviteCodeValid] = useState(null);

  const { signUpWithCredentials } = useAuth();

  // Check if invite-only mode is enabled
  useEffect(() => {
    // Alpha: Check if invite-only mode is enabled via API
    fetch('/api/invites/check-mode')
      .then(res => res.json())
      .then(data => {
        if (data.inviteOnly) {
          setInviteOnlyMode(true);
        }
      })
      .catch(() => {
        // If endpoint doesn't exist, assume invite-only is disabled
        setInviteOnlyMode(false);
      });
  }, []);

  // Validate invite code as user types
  const validateInviteCode = async (code) => {
    if (!code || code.trim() === '') {
      setInviteCodeValid(null);
      return;
    }

    try {
      const res = await fetch('/api/invites/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setInviteCodeValid(data.valid);
      if (!data.valid) {
        setError(data.message || 'Invalid invite code');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Invite code validation error:', err);
      setInviteCodeValid(false);
    }
  };

  // Validate birth date on change
  const handleBirthDateChange = (e) => {
    const date = e.target.value;
    setBirthDate(date);
    
    if (date) {
      const validation = validateBirthDateForSignup(date);
      setAgeValidation(validation);
    } else {
      setAgeValidation(null);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !birthDate) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Validate invite code if invite-only mode is enabled
    if (inviteOnlyMode) {
      if (!inviteCode || inviteCode.trim() === '') {
        setError("Invite code is required for Alpha access");
        setLoading(false);
        return;
      }

      // Validate invite code one more time before signup
      const res = await fetch('/api/invites/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await res.json();
      
      if (!data.valid) {
        setError(data.message || 'Invalid invite code');
        setLoading(false);
        return;
      }
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Validate age
    const validation = validateBirthDateForSignup(birthDate);
    if (!validation.valid) {
      setError(validation.error);
      setLoading(false);
      return;
    }

    try {
      // Store display name and birth date for onboarding
      if (displayName) {
        localStorage.setItem("pendingDisplayName", displayName);
      }
      localStorage.setItem("pendingBirthDate", birthDate);
      
      // Store invite code to use after signup
      if (inviteOnlyMode && inviteCode) {
        localStorage.setItem("pendingInviteCode", inviteCode);
      }

      await signUpWithCredentials({
        email,
        password,
        name: displayName || undefined,
        callbackUrl: "/onboarding",
        redirect: true,
      });
    } catch (err) {
      setError("This email is already registered. Try signing in instead.");
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
          Join {SITE_NAME}
        </h1>
        <p className="mb-8 text-center text-sm text-[#8B8B90]">
          Create your account to get started
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F4F4F5]">
              Display Name
            </label>
            <input
              name="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Choose a display name"
              className="w-full bg-[#1E1E1F] text-white placeholder-[#555555] border border-[#242424] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] focus:border-[#7A5AF8] transition-all"
            />
          </div>
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
              placeholder="Create a password (min 6 characters)"
            />
          </div>
          {inviteOnlyMode && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#F4F4F5]">
                Invite Code <span className="text-[#8B8B90] text-xs">(Required for Alpha access)</span>
              </label>
              <input
                required
                name="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  const code = e.target.value.toUpperCase();
                  setInviteCode(code);
                  validateInviteCode(code);
                }}
                placeholder="Enter your invite code"
                className={`w-full bg-[#1E1E1F] text-white placeholder-[#555555] border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                  inviteCodeValid === false
                    ? 'border-[#FF5656] focus:ring-[#FF5656] focus:border-[#FF5656]'
                    : inviteCodeValid === true
                    ? 'border-[#00FF88] focus:ring-[#7A5AF8] focus:border-[#7A5AF8]'
                    : 'border-[#242424] focus:ring-[#7A5AF8] focus:border-[#7A5AF8]'
                }`}
              />
              {inviteCodeValid === true && (
                <p className="text-xs text-[#00FF88]">
                  ✓ Invite code is valid
                </p>
              )}
              {inviteCodeValid === false && inviteCode && (
                <p className="text-xs text-[#FF5656]">
                  Invalid or already used invite code
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F4F4F5]">
              Birth Date <span className="text-[#8B8B90] text-xs">(Required for age verification)</span>
            </label>
            <input
              required
              name="birthDate"
              type="date"
              value={birthDate}
              onChange={handleBirthDateChange}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
              className={`w-full bg-[#1E1E1F] text-white placeholder-[#555555] border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                ageValidation && !ageValidation.valid
                  ? 'border-[#FF5656] focus:ring-[#FF5656] focus:border-[#FF5656]'
                  : ageValidation && ageValidation.valid
                  ? 'border-[#00FF88] focus:ring-[#7A5AF8] focus:border-[#7A5AF8]'
                  : 'border-[#242424] focus:ring-[#7A5AF8] focus:border-[#7A5AF8]'
              }`}
            />
            {ageValidation && (
              <p className={`text-xs ${
                ageValidation.valid ? 'text-[#00FF88]' : 'text-[#FF5656]'
              }`}>
                {ageValidation.valid 
                  ? `Age: ${ageValidation.age} (${ageValidation.layer === 'minor' ? '13-17' : ageValidation.layer === 'transitional' ? '18-21' : '22+'})`
                  : ageValidation.error
                }
              </p>
            )}
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
          <p className="text-center text-sm text-[#8B8B90]">
            Already have an account?{" "}
            <a
              href="/account/signin"
              className="text-[#7A5AF8] hover:text-[#9F7AEA] font-medium"
            >
              Sign in
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
