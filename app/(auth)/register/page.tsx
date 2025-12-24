import RegisterForm from "../_components/RegisterForm";


export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 py-12">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}