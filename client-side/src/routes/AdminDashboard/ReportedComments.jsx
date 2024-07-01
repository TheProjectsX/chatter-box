import { Pagination, Table } from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import { AdminDataContext } from "../../context/context";

import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet";

const ReportedComments = () => {
  const [loading, setLoading] = useState(null);

  const itemsPerPage = 10;
  const [skip, setSkip] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const dataContext = useContext(AdminDataContext);
  const { statsRefetch } = dataContext;

  const {
    data: commentsData,
    isLoading: commentsLoading,
    refetch: commentsRefetch,
  } = useQuery({
    queryKey: ["user-posts", "user"],
    queryFn: async () => {
      setPageLoading(true);
      const res = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL
        }/admin/reported-comments?skip=${skip}&limit=${itemsPerPage}`,
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
    if (commentsData && commentsData.count !== undefined) {
      const count =
        commentsData.count < itemsPerPage ? itemsPerPage : commentsData.count;
      setTotalPages(Math.ceil(count / itemsPerPage));
    }
  }, [commentsData]);

  useEffect(() => {
    const newSkip = itemsPerPage * (currentPage - 1);
    setSkip(newSkip);
    commentsRefetch();
  }, [currentPage]);

  const handleDeleteComment = async (id) => {
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

    setLoading(id);

    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/admin/comments/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    const data = await res.json();
    if (data.success) {
      toast.success("Comment Deleted Successfully");
      commentsRefetch();
      statsRefetch();
    } else {
      toast.error(data.message);
    }

    setLoading(null);
  };

  return (
    <section>
      <Helmet>
        <title>Reported Comments | Admin Dashboard</title>
      </Helmet>
      <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
        <h3 className="text-2xl font-lato font-semibold">Reported Comments</h3>
      </header>

      <div className="overflow-x-auto mb-4">
        {commentsLoading ? (
          <div className="w-full py-5 text-center">
            <span className="loading loading-lg"></span>
            <p className="text-xl font-semibold dark:text-white mt-2">
              Loading Comments...
            </p>
          </div>
        ) : commentsData.result.length === 0 ? (
          <div className="w-full py-5 text-center">
            <p className="text-xl font-semibold dark:text-white mt-2 italic">
              No Comments to Show!
            </p>
          </div>
        ) : (
          <Table striped>
            <Table.Head>
              <Table.HeadCell>Comment</Table.HeadCell>
              <Table.HeadCell>User</Table.HeadCell>
              <Table.HeadCell>Feedback</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Make Admin</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {commentsData.result.map((item) => (
                <Table.Row
                  key={item._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {item.comment.length > 20 ? (
                      <>
                        {item.comment.slice(0, 20)}
                        <button
                          className="btn btn-link p-0"
                          title="Read More"
                          onClick={() => {
                            Swal.fire(item.comment);
                          }}
                        >
                          ....
                        </button>
                      </>
                    ) : (
                      item.comment
                    )}
                  </Table.Cell>
                  <Table.Cell>{item.authorName}</Table.Cell>
                  <Table.Cell>{item.feedback}</Table.Cell>
                  <Table.Cell className="text-center">
                    {loading === item._id ? (
                      <span className="loading"></span>
                    ) : (
                      <button
                        className="btn btn-error"
                        onClick={() => handleDeleteComment(item._id)}
                        disabled={loading === item._id}
                      >
                        Delete Comment
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

export default ReportedComments;
