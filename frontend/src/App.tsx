import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import LoadingSpinner from "./components/LoadingSpinner";

const Dashboard = React.lazy(() => import("./pages/dashboard/DashboardPage"));

function App() {
  return (
    <Router>
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            {/* Add more routes here */}
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;
