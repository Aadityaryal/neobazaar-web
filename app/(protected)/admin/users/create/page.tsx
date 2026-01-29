import CreateUserForm from "../_components/CreateUserForm";

export default function AdminCreateUserPage() {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Create New User</h1>
          <p className="text-gray-400">Add a new account to the marketplace.</p>
        </div>
        <div className="card">
          <CreateUserForm />
        </div>
      </div>
    </div>
  );
}
