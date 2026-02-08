import React from "react";
import { useSelector } from "react-redux";
import AsmaraDashboard from "./AsmaraDashboard.jsx";
import FactoryDashboard from "./FactoryDashboard.jsx";

const Homepage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="p-4 md:p-8 bg-base-200 min-h-screen">
      {user?.role === "asmara" ? <AsmaraDashboard /> : <FactoryDashboard />}
    </div>
  );
};

export default Homepage;
