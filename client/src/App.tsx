import { createBrowserRouter, RouterProvider } from "react-router-dom";
import VideoPage from "./pages/VideoPage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup"; // Import the new signup page
import SuccessLogin from "./pages/SuccessLogin";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/video-page",
    element: (
      <ProtectedRoute>
        <VideoPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/success-login",
    element: <SuccessLogin />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
