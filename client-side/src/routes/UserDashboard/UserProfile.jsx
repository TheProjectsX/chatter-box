import { useContext } from "react";
import { UserAuthDataContext, UserDataContext } from "../../context/context";
import { HiBadgeCheck } from "react-icons/hi";
import { MdArrowOutward } from "react-icons/md";

import { Table } from "flowbite-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";

const Profile = () => {
  const authContext = useContext(UserAuthDataContext);
  const { userAuthData, userData } = authContext;

  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: postsRefetch,
  } = useQuery({
    queryKey: ["user-posts", "user"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/user/posts?limit=3`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      return data;
    },
  });

  return (
    <section className="space-y-10">
      <Helmet>
        <title>User Profile | User Dashboard</title>
      </Helmet>
      <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
        <h3 className="text-2xl font-lato font-semibold">User Profile</h3>
      </header>

      {/* User Data */}
      <div className="flex flex-col md:flex-row items-center gap-5 shadow-lg border-2 border-gray-700 dark:bg-gray-700 p-4 rounded-lg">
        <div className="flex justify-center ">
          <div className="relative w-fit">
            <img
              src={userAuthData.photoURL}
              alt="Profile Picture"
              className="w-36 rounded-lg"
            />
            <div
              className={`absolute -right-2.5 -top-2.5 text-4xl ${
                userData.badge === "gold"
                  ? "text-yellow-400"
                  : "text-yellow-800"
              }`}
            >
              <HiBadgeCheck />
            </div>
          </div>
        </div>

        <div className="text-center md:text-left">
          <h4 className="text-2xl font-semibold dark:text-white font-lato mb-2">
            {userData.username}
          </h4>
          <p className="dark:text-white">{userAuthData.email}</p>
          <p>
            Membership Status:{" "}
            <span className="dark:text-white font-semibold">
              {userData.membershipStatus}
            </span>
          </p>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h3 className="text-xl font-semibold underline underline-offset-4 mb-4">
          Recent Posts:{" "}
        </h3>

        <div className="overflow-x-auto">
          {postsLoading ? (
            <div className="w-full py-5 text-center">
              <span className="loading loading-lg"></span>
              <p className="text-xl font-semibold dark:text-white mt-2">
                Loading Posts...
              </p>
            </div>
          ) : postsData.result.length === 0 ? (
            <div className="w-full py-5 text-center">
              <p className="text-xl font-semibold dark:text-white mt-2 italic">
                No Recent Posts to Show!
              </p>
              <Link to="/me/new-post" className="btn btn-link">
                Create a new Post Now!
              </Link>
            </div>
          ) : (
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Title</Table.HeadCell>
                <Table.HeadCell className="text-center">
                  Comments
                </Table.HeadCell>
                <Table.HeadCell className="text-center">UpVotes</Table.HeadCell>
                <Table.HeadCell className="text-center">
                  DownVotes
                </Table.HeadCell>
                <Table.HeadCell>
                  <span className="sr-only">View</span>
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {postsData.result.slice(0, 3).map((item) => (
                  <Table.Row
                    key={item._id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white max-w-56 text-wrap">
                      {item.title}
                    </Table.Cell>
                    <Table.Cell className="text-center">
                      {item.commentsCount}
                    </Table.Cell>
                    <Table.Cell className="text-center">
                      {item.upVotes}
                    </Table.Cell>
                    <Table.Cell className="text-center">
                      {item.downVotes}
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        to={`/posts/${item._id}`}
                        className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 underline-offset-2 flex items-center gap-2"
                      >
                        View <MdArrowOutward />
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profile;
