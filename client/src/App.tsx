import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import VideoPage from "./pages/VideoPage";

const router = createBrowserRouter([
  {
    path: "/video-page",
    element: <VideoPage />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />,
    </>
  );
}

export default App;
