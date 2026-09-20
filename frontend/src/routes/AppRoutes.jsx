import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Dashboard from "../pages/Dashboard";

import ClientList from "../pages/clients/ClientList";
import AddClient from "../pages/clients/AddClient";
import EditClient from "../pages/clients/EditClient";

import InvoiceList from "../pages/invoices/InvoiceList";
import CreateInvoice from "../pages/invoices/CreateInvoice";
import InvoiceDetails from "../pages/invoices/InvoiceDetails";
import EditInvoice from "../pages/invoices/EditInvoice";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import PaymentPage from "../pages/payments/PaymentPage";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Protected Routes */}

                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>

                        {/* Dashboard */}

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        {/* Clients */}

                        <Route
                            path="/clients"
                            element={<ClientList />}
                        />

                        <Route
                            path="/clients/add"
                            element={<AddClient />}
                        />

                        <Route
                            path="/clients/edit/:id"
                            element={<EditClient />}
                        />

                        {/* Invoices */}

                        <Route
                            path="/invoices"
                            element={<InvoiceList />}
                        />

                        <Route
                            path="/invoices/add"
                            element={<CreateInvoice />}
                        />

                        <Route
                            path="/invoices"
                            element={<InvoiceList />}
                        />

                        <Route
                            path="/invoices/add"
                            element={<CreateInvoice />}
                        />

                        <Route
                            path="/invoices/:id"
                            element={<InvoiceDetails />}
                        />

                        <Route
                            path="/invoices/edit/:id"
                            element={<EditInvoice />}
                        />

                        {/*payments*/}
                        <Route
                            path="/payments"
                            element={<PaymentPage />}
                        />


                    </Route>
                </Route>

                {/* Unknown URL */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;