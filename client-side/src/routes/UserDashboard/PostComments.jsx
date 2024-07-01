import { useQuery } from "@tanstack/react-query";
import { Pagination, Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const PostComments = () => {
  const { postId } = useParams();
  const [feedback, setFeedback] = useState("Inappropriate");

  const itemsPerPage = 10;
  const [skip, setSkip] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    data: commentsData,
    isLoading,
    refetch: commentsRefetch,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      setPageLoading(true);
      const res = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL
        }/comments/${postId}?skip=${skip}&limit=${itemsPerPage}`
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

  const handleReport = async (commentId) => {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/comments/${commentId}/report`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ feedback }),
      }
    );
    const data = await res.json();

    if (data.success) {
      toast.success("Comment Reported");
      commentsRefetch();
    } else {
      toast.error(data.message);
    }
  };

  return (
    <section>
      <Helmet>
        <title>Post Comments | User Dashboard</title>
      </Helmet>
      <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
        <h3 className="text-2xl font-lato font-semibold">Post Comments</h3>
      </header>

      <div className="overflow-x-auto mb-4">
        {isLoading ? (
          <div className="text-center py-4">
            <span className="loading loading-lg"></span>
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
              <Table.HeadCell>Author Email</Table.HeadCell>
              <Table.HeadCell>Feedback</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Report</span>
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
                  <Table.Cell>{item.authorEmail}</Table.Cell>
                  <Table.Cell>
                    <select
                      className="bg-gray-200 dark:bg-gray-900 border-none outline-none"
                      defaultValue={
                        item.feedback ? item.feedback : "Inappropriate"
                      }
                      disabled={item.feedback !== undefined}
                      onChange={(e) => setFeedback(e.target.value)}
                    >
                      <option value="Inappropriate">Inappropriate</option>
                      <option value="Spam">Spam</option>
                      <option value="Off-Topic">Off-Topic</option>
                    </select>
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    {item.reported ? (
                      "Reported"
                    ) : (
                      <button
                        className="btn btn-info"
                        onClick={() => handleReport(item._id)}
                      >
                        Report
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

export default PostComments;
