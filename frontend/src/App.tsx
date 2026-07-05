import { RouterProvider } from "react-router-dom";
import { ThemeSync } from "@/components/ThemeSync";
import { router } from "./routes";

function App() {
  return (
    <>
      <ThemeSync />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
