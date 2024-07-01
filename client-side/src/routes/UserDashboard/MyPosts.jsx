import { Table, Pagination } from "flowbite-react";
import { Link } from "react-router-dom";

import { MdArrowOutward } from "react-icons/md";
import { useContext, useEffect, useState } from "react";
import { UserDataContext } from "../../context/context";

import Swal from "sweetalert2";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";

const MyPosts = () => {
  const itemsPerPage = 10;
  const [skip, setSkip] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: postsRefetch,
  } = useQuery({
    queryKey: ["user-posts", "user"],
    queryFn: async () => {
      setPageLoading(true);
      const res = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL
        }/user/posts?skip=${skip}&limit=${itemsPerPage}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setPageLoading(false);
      return data;
    },
  });

  useEffect(() => {
    if (postsData && postsData.count !== undefined) {
      const count =
        postsData.count < itemsPerPage ? itemsPerPage : postsData.count;
      setTotalPages(Math.ceil(count / itemsPerPage));
    }
  }, [postsData]);

  useEffect(() => {
    const newSkip = itemsPerPage * (currentPage - 1);
    setSkip(newSkip);
    postsRefetch();
  }, [currentPage]);

  const handlePostDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you Sure?",
      text: "This cannot be reverted!",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) {
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/posts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      postsRefetch();
      toast.success("Post Deleted Successfully!");
    } else {
      toast.error(data.message);
    }
  };

  return (
    <section>
      <Helmet>
        <title>My Posts | User Dashboard</title>
      </Helmet>
      <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
        <h3 className="text-2xl font-lato font-semibold">My Posts</h3>
      </header>

      <div className="overflow-x-auto mb-4">
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
              No Posts to Show!
            </p>
            <Link to="/me/new-post" className="btn btn-link">
              Create a new Post Now!
            </Link>
          </div>
        ) : (
          <Table striped>
            <Table.Head>
              <Table.HeadCell>Title</Table.HeadCell>
              <Table.HeadCell className="text-center">UpVotes</Table.HeadCell>
              <Table.HeadCell className="text-center">DownVotes</Table.HeadCell>
              <Table.HeadCell className="text-center">
                <span className="sr-only">View Comments</span>
              </Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Delete Post</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {postsData.result.map((item) => (
                <Table.Row
                  key={item._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white max-w-56 text-wrap">
                    {item.title}
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    {item.upVotes}
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    {item.downVotes}
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      to={`/me/comments/${item._id}`}
                      className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 underline-offset-2 flex items-center gap-2"
                    >
                      View Comments ({item.commentsCount}) <MdArrowOutward />
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <button
                      className="btn btn-error"
                      onClick={() => handlePostDelete(item._id)}
                    >
                      Delete
                    </button>
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

export default MyPosts;
