import { BrowserRouter } from "react-router";
import { Toaster } from "sonner";
import AppRoutes from "@/routes";
import { AuthInitializer } from "@/features/auth/components/AuthInitializer";

const App = () => {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#191b22",
              border: "1px solid rgba(255,255,255,0.05)",
              color: "#fff",
            },
          }}
        />
        <AppRoutes />
      </AuthInitializer>
    </BrowserRouter>
  );
};

export default App;
