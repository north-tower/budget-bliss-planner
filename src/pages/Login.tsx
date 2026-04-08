import { Navigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-53px)] flex items-center justify-center bg-background px-5 py-10">
      <AuthForm />
    </div>
  );
}
