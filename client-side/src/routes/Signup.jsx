import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserAuthDataContext } from "../context/context";

// Icons
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

// React Toast
import { toast } from "react-toastify";

// Firebase Auth Provider
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import auth from "../firebase/config";

// React Helmet
import { Helmet } from "react-helmet";

import { useForm } from "react-hook-form";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const context = useContext(UserAuthDataContext);
  const { setUserAuthData, setCookieLoaded } = context;

  useEffect(() => {
    setCookieLoaded(false);
  }, []);

  const [loading, setLoading] = useState(false);

  // Sign up using Google
  const handleGoogleSignUp = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (userData) => {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/users`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: userData.user.email,
            username: userData.user.displayName,
          }),
        });
        const data = await res.json();
        setCookieLoaded(true);

        toast.success("Sign Up Successful!");
      })
      .catch((error) => console.log(error));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleSignUp = (data) => {
    const { fullName, photoUrl, email, password } = data;

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must Contain at least one UpperCase Character", {
        autoClose: 5000,
      });
      return;
    } else if (!/[a-z]/.test(password)) {
      toast.error("Password must Contain at least one LowerCase Character", {
        autoClose: 5000,
      });

      return;
    }

    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userData) => {
        toast.success("Sign Up Successful!");
        await updateProfile(userData.user, {
          displayName: fullName,
          photoURL:
            photoUrl !== ""
              ? photoUrl
              : "https://i.ibb.co/c10qCXL/dummy-profile-picture.jpg",
        });
        setUserAuthData(userData.user);

        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/users`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: userData.user.email,
            username: userData.user.displayName,
          }),
        });

        const data = await res.json();
        setCookieLoaded(true);
      })
      .catch((error) => {
        if (error.code === "auth/invalid-credential") {
          toast.error("Incorrect Credentials!");
        } else if (error.code === "auth/too-many-requests") {
          toast.error("Too many Invalid Login attempts!");
        } else if (error.code === "auth/email-already-in-use") {
          toast.error("Email Already in Use!");
        } else {
          toast.error("Error Ocurred in the Server");
        }
        setLoading(false);
      });
  };

  return (
    <section className="">
      <Helmet>
        <title>Create new Account | Chatter Box</title>
      </Helmet>
      <div className="flex flex-col items-center justify-center sm:px-6 py-8 mx-auto">
        <h3 className="flex items-center mb-6 text-2xl font-semibold dark:text-white font-lato">
          Hello There!
        </h3>
        <div className="rounded-lg shadow-lg border md:mt-0 w-full sm:w-[34rem] xl:p-0 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl dark:text-white text-center underline underline-offset-8">
              Create a New Account
            </h1>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                className="px-6 py-2.5 flex justify-center items-center gap-2 border border-[#4b5563] rounded-lg hover:bg-gray-200 dark:hover:bg-[#374151] dark:text-white dark:hover:text-gray-200"
                onClick={handleGoogleSignUp}
              >
                <FcGoogle className="text-xl" />
                Continue with Google
              </button>
            </div>
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-400"></div>
              <span className="flex-shrink mx-4 dark:first:text-gray-400">
                Or
              </span>
              <div className="flex-grow border-t border-gray-400"></div>
            </div>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={handleSubmit(handleSignUp)}
            >
              <div>
                <label className="block text-sm font-medium dark:text-white">
                  Your Full Name <span className="text-red-600">*</span>
                  <input
                    type="text"
                    {...register("fullName", { required: true })}
                    className={`mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5 bg-gray-200 dark:bg-gray-700  dark:placeholder-gray-400 ${
                      errors.fullName === undefined
                        ? "dark:border-gray-600 focus:border-blue-500 dark:focus:border-gray-400"
                        : "border-red-600 dark:border-red-600 focus:border-red-600 dark:focus:border-red-600"
                    }`}
                    placeholder="Mr XYZ"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white">
                  Your Email <span className="text-red-600">*</span>
                  <input
                    type="email"
                    {...register("email", { required: true })}
                    className={`mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5 bg-gray-200 dark:bg-gray-700  dark:placeholder-gray-400 ${
                      errors.email === undefined
                        ? "dark:border-gray-600 focus:border-blue-500 dark:focus:border-gray-400"
                        : "border-red-600 dark:border-red-600 focus:border-red-600 dark:focus:border-red-600"
                    }`}
                    placeholder="name@company.com"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white">
                  Your Photo URL
                  <input
                    type="text"
                    {...register("photoUrl")}
                    className="mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5 bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-gray-400"
                    placeholder="https://example.com/...."
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white relative">
                  Password <span className="text-red-600">*</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: true, minLength: 6 })}
                    placeholder={showPassword ? "123456" : "••••••"}
                    minLength={6}
                    className={`mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5 bg-gray-200 dark:bg-gray-700  dark:placeholder-gray-400 ${
                      errors.password === undefined
                        ? "dark:border-gray-600 focus:border-blue-500 dark:focus:border-gray-400"
                        : "border-red-600 dark:border-red-600 focus:border-red-600 dark:focus:border-red-600"
                    }`}
                  />
                  <div
                    className="absolute right-1 top-8 text-xl p-2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="ml-3 text-sm">
                  <label className="dark:text-gray-300 items-center flex gap-2">
                    <input
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border rounded focus:ring-3 bg-gray-700 border-gray-600 focus:ring-[#2563eb] ring-offset-gray-800"
                    />
                    Remember me
                  </label>
                </div>
              </div>
              <button
                type="submit"
                name="submit"
                className={`w-full text-white bg-blue-500 hover:bg-blue-600 dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8] focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                  loading ? "cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? <span className="loading"></span> : "Sign Up"}
              </button>
              <p className="text-sm font-light dark:text-gray-400">
                Already have an Account?{" "}
                <Link
                  to="/login"
                  className="font-medium hover:underline text-[#3b82f6] pl-4"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
