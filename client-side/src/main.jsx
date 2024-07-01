import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// React Router Dom
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Components
import { Flowbite } from "flowbite-react";
import App from "./App.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminPrivateRoute from "./components/AdminPrivateRoute.jsx";

// Routes
import Login from "./routes/Login.jsx";
import SignUp from "./routes/Signup.jsx";
import Home from "./routes/Home.jsx";
import Membership from "./routes/Payment/Membership.jsx";
import UserDashboardWrapper from "./routes/UserDashboard/UserDashboardWrapper.jsx";
import UserDashboard from "./routes/UserDashboard/UserDashboard.jsx";
import UserProfile from "./routes/UserDashboard/UserProfile.jsx";
import AddPost from "./routes/UserDashboard/AddPost.jsx";
import MyPosts from "./routes/UserDashboard/MyPosts.jsx";
import AdminDashboardWrapper from "./routes/AdminDashboard/AdminDashboardWrapper.jsx";
import AdminDashboard from "./routes/AdminDashboard/AdminDashboard.jsx";
import ManageUsers from "./routes/AdminDashboard/ManageUsers.jsx";
import ReportedComments from "./routes/AdminDashboard/ReportedComments.jsx";
import Announcements from "./routes/AdminDashboard/Announcements.jsx";
import PostComments from "./routes/UserDashboard/PostComments.jsx";
import PostDetails from "./routes/PostDetails.jsx";
import NotFound from "./routes/NotFound.jsx";

// Router
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: async () => localStorage.getItem("themeMode"),
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Home />,
        loader: async () => {
          const announcements = await (
            await fetch(`${import.meta.env.VITE_SERVER_URL}/announcements`)
          ).json();

          const posts = await (
            await fetch(`${import.meta.env.VITE_SERVER_URL}/posts`)
          ).json();

          const tags = await (
            await fetch(`${import.meta.env.VITE_SERVER_URL}/tags`)
          ).json();

          return {
            announcements,
            posts,
            tags,
          };
        },
      },
      {
        path: "/membership",
        element: (
          <PrivateRoute>
            <Membership />
          </PrivateRoute>
        ),
      },
      {
        path: "/posts/:id",
        element: <PostDetails />,
        loader: async ({ params }) => {
          const postData = await (
            await fetch(`${import.meta.env.VITE_SERVER_URL}/posts/${params.id}`)
          ).json();

          const commentsData = await (
            await fetch(
              `${import.meta.env.VITE_SERVER_URL}/comments/${params.id}`
            )
          ).json();

          return { postData, commentsData };
        },
      },
      {
        path: "/login",
        element: (
          <PrivateRoute reverse>
            <Login />
          </PrivateRoute>
        ),
      },
      {
        path: "/sign-up",
        element: (
          <PrivateRoute reverse>
            <SignUp />
          </PrivateRoute>
        ),
      },
      {
        path: "/me",
        element: (
          <PrivateRoute>
            <UserDashboardWrapper />
          </PrivateRoute>
        ),
        children: [
          {
            path: "/me/dashboard",
            element: <UserDashboard />,
          },
          {
            path: "/me/profile",
            element: <UserProfile />,
          },
          {
            path: "/me/new-post",
            element: <AddPost />,
            loader: async () => {
              return [
                await (
                  await fetch(
                    `${import.meta.env.VITE_SERVER_URL}/user/posts?limit=1`,
                    {
                      credentials: "include",
                    }
                  )
                ).json(),
                await (
                  await fetch(`${import.meta.env.VITE_SERVER_URL}/tags`)
                ).json(),
              ];
            },
          },
          {
            path: "/me/posts",
            element: <MyPosts />,
          },
          {
            path: "/me/comments/:postId",
            element: <PostComments />,
          },
        ],
      },

      {
        path: "/admin",
        element: (
          <AdminPrivateRoute>
            <AdminDashboardWrapper />
          </AdminPrivateRoute>
        ),
        children: [
          {
            path: "/admin/dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "/admin/users",
            element: <ManageUsers />,
          },
          {
            path: "/admin/reported-comments",
            element: <ReportedComments />,
          },
          {
            path: "/admin/announcements",
            element: <Announcements />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Flowbite>
      <RouterProvider router={router} />
    </Flowbite>
  </React.StrictMode>
);
