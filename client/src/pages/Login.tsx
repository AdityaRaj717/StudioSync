import { LoginForm } from "@/components/login-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleGoogleLogin = () => {
    try {
      setIsLoading(true);
      const googleLoginUrl = `${apiUrl}/auth/google`;
      window.location.href = googleLoginUrl;
    } catch (error) {
      console.error("Error login with google", error);
    } finally {
      setIsLoading(false);
    }
  };

  const userData = localStorage.getItem("user");

  useEffect(() => {
    if (userData) navigate("/video-page");
  }, [navigate, userData]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm googleLogin={handleGoogleLogin} isLoading={isLoading} />
      </div>
    </div>
  );
}
