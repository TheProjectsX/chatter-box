// Components
import { UserAuthDataContext } from "./context/context";
import NavbarComponent from "./components/Navbar";
import FooterComponent from "./components/Footer";
import { Outlet, useLoaderData } from "react-router-dom";

// React Toast
import { ToastContainer, Bounce, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Firebase Auth
import { onAuthStateChanged, signOut } from "firebase/auth";
import auth from "./firebase/config";
import { useEffect, useReducer, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const savedTheme = useLoaderData();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const [dataLoading, setDataLoading] = useState(true);
  const [cookieLoaded, setCookieLoaded] = useState(true);
  const [userAuthData, setUserAuthData] = useState(null);
  const [themeMode, setThemeMode] = useState(savedTheme ?? "light");
  const [userData, setUserData] = useState(null);
  const themeElmRef = useRef(null);

  const queryClient = new QueryClient();

  // Logout User
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/logout`, {
          credentials: "include",
        });
        toast.info("Please Login");
      })
      .catch((error) => console.log(error));
  };

  // Auth Change Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user === null) {
        setDataLoading(false);
        setUserAuthData(user);
        return;
      }

      if (!cookieLoaded) {
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/me`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) {
        handleLogout();
      } else {
        setUserData(data);
        setUserAuthData(user);
      }
      setDataLoading(false);
    });
    return () => unsubscribe();
  }, [cookieLoaded]);

  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.dataset.theme = "sunset";
      themeElmRef.current.dataset.theme = "night";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.dataset.theme = "";
      themeElmRef.current.dataset.theme = "";
    }
  }, [themeMode]);

  return (
    <>
      <ToastContainer
        position="top-left"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <div
        className="max-w-[1100px] mx-auto font-ubuntu shadow-2xl bg-gray-100 dark:bg-slate-700"
        data-theme="night"
        ref={themeElmRef}
      >
        <UserAuthDataContext.Provider
          value={{
            userAuthData,
            setUserAuthData,
            userData,
            setUserData,
            cookieLoaded,
            setCookieLoaded,
            dataLoading,
            setDataLoading,
            forceUpdate,
            themeMode,
            setThemeMode,
          }}
        >
          <NavbarComponent />
          <div className="p-2 sm:p-4 my-3 space-y-10 bg-white dark:bg-slate-900">
            <QueryClientProvider client={queryClient}>
              <Outlet />
            </QueryClientProvider>
          </div>
          <FooterComponent />
        </UserAuthDataContext.Provider>
      </div>
    </>
  );
}

export default App;
