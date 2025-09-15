import { LoginForm } from "@/components/auth/login-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await axios.post(
        `${apiUrl}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      alert(error.response?.data?.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          handleLogin={handleLogin}
          googleLogin={handleGoogleLogin}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
