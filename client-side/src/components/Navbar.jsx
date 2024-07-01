import {
  Avatar,
  Button,
  DarkThemeToggle,
  Dropdown,
  Navbar,
  Spinner,
} from "flowbite-react";
import { Link, NavLink } from "react-router-dom";
import { UserAuthDataContext } from "../context/context";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { signOut } from "firebase/auth";
import auth from "../firebase/config";

// React Icons
import { MdSunny } from "react-icons/md";
import { IoMoonSharp } from "react-icons/io5";

const NavbarComponent = () => {
  const context = useContext(UserAuthDataContext);
  const { userAuthData, userData, dataLoading, themeMode, setThemeMode } =
    context;

  const [announcementsCount, setAnnouncementsCount] = useState(null);

  // Logout User
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/logout`, {
          credentials: "include",
        });
        toast.success("Logout Successful");
      })
      .catch((error) => console.log(error));
  };

  const NavLinks = () => (
    <>
      <li>
        <NavLink to="/">Home</NavLink>
      </li>
      <li>
        <NavLink to="/membership">Membership</NavLink>
      </li>
      <li>
        <button
          className="text-xl sm:hidden"
          onClick={() => {
            setThemeMode(themeMode === "dark" ? "light" : "dark");
          }}
          data-tooltip-id="elm-tooltip"
          data-tooltip-content={`Change Theme to ${
            themeMode === "dark" ? "Light" : "Dark"
          }`}
        >
          {themeMode === "dark" ? <MdSunny /> : <IoMoonSharp />}
        </button>
      </li>
    </>
  );

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/announcements/count`)
      .then((res) => res.json())
      .then((data) => setAnnouncementsCount(data.count));
  }, []);

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
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
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 z-10"
          >
            <NavLinks />
          </ul>
        </div>
        <Link to={"/"} className="btn btn-ghost text-lg sm:text-xl">
          <img src="/logo.png" alt="Chatter box" className="w-6" />
          Chatter Box
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 space-x-2">
          <NavLinks />
        </ul>
      </div>
      <div className="navbar-end gap-2">
        <button
          className="text-xl hidden sm:block"
          onClick={() => {
            setThemeMode(themeMode === "dark" ? "light" : "dark");
          }}
          data-tooltip-id="elm-tooltip"
          data-tooltip-content={`Change Theme to ${
            themeMode === "dark" ? "Light" : "Dark"
          }`}
        >
          {themeMode === "dark" ? <MdSunny /> : <IoMoonSharp />}
        </button>

        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="badge badge-sm indicator-item">
              {announcementsCount}
            </span>
          </div>
        </button>
        {dataLoading ? (
          <span className="loading loading-dots loading-md"></span>
        ) : userAuthData ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt="User settings" img={userAuthData.photoURL} rounded />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">{userData?.username}</span>
              <span className="block truncate text-sm font-medium">
                {userAuthData.email}
              </span>
            </Dropdown.Header>
            {userData?.role === "admin" ? (
              <>
                <Link to="/me/dashboard">
                  <Dropdown.Item>User Dashboard</Dropdown.Item>
                </Link>
                <Link to="/admin/dashboard">
                  <Dropdown.Item>Admin Dashboard</Dropdown.Item>
                </Link>
              </>
            ) : (
              <Link to="/me/dashboard">
                <Dropdown.Item>Dashboard</Dropdown.Item>
              </Link>
            )}
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/login" className="btn btn-info">
            Join Us
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavbarComponent;
