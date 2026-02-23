import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("volunteer");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("Logging in with:", { email, password, role });

    const result = await login(email, password, role);

    console.log("Login result:", result);

    setIsLoading(false);

    if (result.success) {
      console.log("Navigating to dashboard...");
      navigate("/dashboard");
    } else {
      setError(result.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Side - Green Background with Logo */}
      <div className="w-1/2 bg-gradient-to-b from-green-500 to-green-600 flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-6">
          {/* Recycling Logo */}
          <div className="text-6xl">
            <svg className="w-24 h-24" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 10 L85 45 L70 45 L85 60 L50 90 L50 70 L30 70 L50 45 L35 45 Z" opacity="0.8"/>
              <path d="M30 50 L50 30 L50 50 L70 50 L50 75 Z" opacity="0.6"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold">WasteZero Initiative</h1>
          <p className="text-center text-lg max-w-xs">
            Together we care for the future of the next generations
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-8">
            Enter your details to log in.
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("volunteer")}
                className={`py-3 rounded-lg font-semibold transition-colors duration-200 ${
                  role === "volunteer"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                🤝 Volunteer
              </button>
              <button
                type="button"
                onClick={() => setRole("ngo")}
                className={`py-3 rounded-lg font-semibold transition-colors duration-200 ${
                  role === "ngo"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                🏢 NGO
              </button>
            </div>

            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Enter your email (optional for demo)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password (optional for demo)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 dark:bg-gray-800 dark:text-white"
              />
              <span className="absolute right-3 top-3 text-2xl">🔒</span>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 text-lg disabled:bg-green-300"
            >
              {isLoading ? "Logging in..." : "Continue"}
            </button>
          </form>

          {/* Demo Mode Notice */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              💡 Demo Mode: Click Continue without entering credentials to explore
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-3 text-gray-500 dark:text-gray-400 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <span className="text-xl">🔍</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Continue with Google</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <span className="text-xl">📘</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Continue with Facebook</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <span className="text-xl">🍎</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Continue with Apple</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <a href="/register" className="text-green-500 font-semibold hover:underline">
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
