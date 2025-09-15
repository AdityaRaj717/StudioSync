import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import VideoPage from "./pages/VideoPage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import SuccessLogin from "./pages/SuccessLogin";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardPage from "./pages/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
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
