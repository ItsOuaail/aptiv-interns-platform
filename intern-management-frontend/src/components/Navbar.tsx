import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <nav className="bg-dark-blue text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Intern Management</h1>
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;