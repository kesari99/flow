import { RouterProvider } from "react-router-dom";
import { ThemeSync } from "@/components/ThemeSync";
import { AppProviders } from "@/providers/AppProviders";
import { router } from "./routes";

function App() {
  return (
    <AppProviders>
      <ThemeSync />
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
