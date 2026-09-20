import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg mb-2 ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 min-h-screen bg-white border-r p-5">
      <h1 className="text-2xl font-bold text-blue-600 mb-8">
        InvoiceFlow
      </h1>

      <nav>
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/clients" className={linkClass}>
          Clients
        </NavLink>

        <NavLink to="/invoices" className={linkClass}>
          Invoices
        </NavLink>

        <NavLink to="/payments" className={linkClass}>
          Payments
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;