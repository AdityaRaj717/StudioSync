import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router-dom";
import VideoPage from "./pages/VideoPage";
import LoginPage from "./pages/Login"; // Renamed for clarity from the file
import SuccessLogin from "./pages/SuccessLogin";
import ProtectedRoute from "./components/auth/ProtectedRoute"; // 1. Import the new component

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
