import { Suspense } from "react";
import AuthForm from "../components/auth/authForm";
import Loading from "../components/loading";

export default function Signup() {
  return (
    <div className="min-h-screen ">
      <Suspense fallback={<Loading />}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
