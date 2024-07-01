import { NavLink, Outlet } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { AdminDataContext } from "../../context/context";

const AdminDashboardWrapper = () => {
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: statsRefetch,
  } = useQuery({
    queryKey: ["website-stats", "admin"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/stats`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      return data;
    },
  });

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <div className="w-full flex justify-end">
          <label
            htmlFor="my-drawer-2"
            className="btn drawer-button lg:hidden mb-3 lg:m-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
        </div>

        <div className="lg:pl-5">
          <AdminDataContext.Provider
            value={{
              statsData,
              statsLoading,
              statsRefetch,
            }}
          >
            <Outlet />
          </AdminDataContext.Provider>
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu p-4 w-64 min-h-full bg-base-200 text-base-content space-y-3">
          {/* Sidebar content here */}
          <li>
            <NavLink to="/admin/dashboard">Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/admin/users">Manage Users</NavLink>
          </li>
          <li>
            <NavLink to="/admin/reported-comments">Reported Comments</NavLink>
          </li>
          <li>
            <NavLink to="/admin/announcements">Make Announcements</NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboardWrapper;
