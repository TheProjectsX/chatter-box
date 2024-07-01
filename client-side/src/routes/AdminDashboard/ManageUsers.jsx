import { Pagination, Table } from "flowbite-react";
import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";

const ManageUsers = () => {
  const [adminLoading, setAdminLoading] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const itemsPerPage = 10;
  const [skip, setSkip] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [username, setUsername] = useState("");

  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: usersRefetch,
  } = useQuery({
    queryKey: ["user-posts", "user"],
    queryFn: async () => {
      setPageLoading(true);
      const res = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL
        }/admin/users?username=${username}&skip=${skip}&limit=${itemsPerPage}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setPageLoading(false);
      setSearchLoading(false);
      return data;
    },
  });

  useEffect(() => {
    if (usersData && usersData.count !== undefined) {
      const count =
        usersData.count < itemsPerPage ? itemsPerPage : usersData.count;
      setTotalPages(Math.ceil(count / itemsPerPage));
    }
  }, [usersData]);

  useEffect(() => {
    const newSkip = itemsPerPage * (currentPage - 1);
    setSkip(newSkip);
    usersRefetch();
  }, [currentPage]);

  const handleMakeAdmin = async (id) => {
    setAdminLoading(id);

    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/admin/users/make-admin`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ id }),
      }
    );
    const data = await res.json();
    if (data.success) {
      toast.success("Successfully Promoted to Admin");
      usersRefetch();
    } else {
      toast.error(data.message);
    }

    setAdminLoading(null);
  };

  return (
    <section>
      <Helmet>
        <title>Manage Users | Admin Dashboard</title>
      </Helmet>
      <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
        <h3 className="text-2xl font-lato font-semibold">Manage Users</h3>
      </header>

      <form
        className="flex gap-3 items-end px-2 sm:px-8 mb-10"
        onSubmit={(e) => {
          e.preventDefault();
          setSearchLoading(true);
          usersRefetch();
        }}
      >
        <div className="flex-grow">
          <label className="block text-sm font-medium dark:text-white">
            Search User by Username
            <input
              type="text"
              name="username"
              className="mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-gray-400"
              placeholder="Enter Username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>

        <button className="btn btn-info" disabled={searchLoading} type="submit">
          {searchLoading ? <span className="loading"></span> : "Search"}
        </button>
      </form>
      <div className="overflow-x-auto mb-4">
        {usersLoading ? (
          <div className="w-full py-5 text-center">
            <span className="loading loading-lg"></span>
            <p className="text-xl font-semibold dark:text-white mt-2">
              Loading Users...
            </p>
          </div>
        ) : (
          <Table striped>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Subscription Status</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Make Admin</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {usersData.result.map((item) => (
                <Table.Row
                  key={item._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {item.username}
                  </Table.Cell>
                  <Table.Cell>{item.email}</Table.Cell>
                  <Table.Cell>{item.membershipStatus}</Table.Cell>
                  <Table.Cell className="text-center">
                    {item.role === "admin" ? (
                      "Already an Admin"
                    ) : adminLoading === item._id ? (
                      <span className="loading"></span>
                    ) : (
                      <button
                        className="btn btn-info"
                        onClick={() => handleMakeAdmin(item._id)}
                        disabled={adminLoading === item._id}
                      >
                        Make Admin
                      </button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
      <div className="flex overflow-x-auto justify-center gap-3">
        <span
          className={`loading ${pageLoading ? "visible" : "invisible"}`}
        ></span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          showIcons
        />
        <span className="loading invisible"></span>{" "}
      </div>
    </section>
  );
};

export default ManageUsers;
