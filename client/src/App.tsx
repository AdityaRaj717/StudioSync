import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import VideoPage from "./pages/VideoPage";
import Login from "./pages/Login";
import SuccessLogin from "./pages/SuccessLogin";

const router = createBrowserRouter([
  {
    path: "/video-page",
    element: <VideoPage />,
  },
  {
    path: "/login",
    element: <Login />,
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
