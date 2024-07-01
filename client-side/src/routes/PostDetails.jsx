import { Avatar, Button } from "flowbite-react";
import {
  Navigate,
  useNavigate,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import { RiTimeFill } from "react-icons/ri";
import { BiUpvote, BiDownvote } from "react-icons/bi";
import { RiShareForward2Fill } from "react-icons/ri";

import moment from "moment";
import { useContext, useState } from "react";
import { UserAuthDataContext } from "../context/context";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";

import Swal from "sweetalert2";

import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
} from "react-share";
import { Helmet } from "react-helmet";

const PostDetails = () => {
  const context = useContext(UserAuthDataContext);
  const { userAuthData } = context;
  const { postData } = useLoaderData();

  const location = useLocation();

  const [userUpVoted, setUserUpVoted] = useState(false);
  const [userDownVoted, setUserDownVoted] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    data: commentsData,
    isLoading: commentsLoading,
    refetch: commentsRefetch,
  } = useQuery({
    queryKey: ["comments", postData._id],
    queryFn: async () =>
      await (
        await fetch(
          `${import.meta.env.VITE_SERVER_URL}/comments/${postData._id}`
        )
      ).json(),
  });

  if (!postData.success) {
    return <Navigate to="/" replace />;
  }

  const performUpVote = async (vote) => {
    return await (
      await fetch(
        `${import.meta.env.VITE_SERVER_URL}/posts/${
          postData._id
        }/upvote/${vote}`,
        {
          method: "PUT",
          credentials: "include",
        }
      )
    ).json();
  };

  const performDownVote = async (vote) => {
    return await (
      await fetch(
        `${import.meta.env.VITE_SERVER_URL}/posts/${
          postData._id
        }/downvote/${vote}`,
        {
          method: "PUT",
          credentials: "include",
        }
      )
    ).json();
  };

  const userLoggedIn = async () => {
    if (userAuthData) return true;

    const result = await Swal.fire({
      title: "You are not Logged In!",
      text: "You Must Login to use this Feature",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Login",
    });

    if (result.isConfirmed) {
      navigate("/login");
      return false;
    }
  };

  const handleUpVote = async () => {
    if (!(await userLoggedIn())) {
      return;
    }
    if (userUpVoted) {
      await performUpVote("remove");
      postData["upVotes"] = postData["upVotes"] - 1;
      setUserUpVoted(false);
      return;
    } else if (userDownVoted) {
      await performDownVote("remove");
      postData["downVotes"] = postData["downVotes"] - 1;
      setUserDownVoted(false);
    }

    // Add Up Vote
    const voted = await performUpVote("add");
    if (voted.success) {
      postData["upVotes"] = postData["upVotes"] + 1;
      setUserUpVoted(true);
    }
  };
  const handleDownVote = async () => {
    if (!(await userLoggedIn())) {
      return;
    }
    if (userDownVoted) {
      await performDownVote("remove");
      postData["downVotes"] = postData["downVotes"] - 1;
      setUserDownVoted(false);
      return;
    } else if (userUpVoted) {
      await performUpVote("remove");
      postData["upVotes"] = postData["upVotes"] - 1;
      setUserUpVoted(false);
    }

    // Add Down Vote
    const voted = await performDownVote("add");
    if (voted.success) {
      postData["downVotes"] = postData["downVotes"] + 1;
      setUserDownVoted(true);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    setLoading(true);

    const comment = e.target.comment.value;
    const authorName = userAuthData.displayName;
    const authorEmail = userAuthData.email;
    const authorImage = userAuthData.photoURL;
    const postId = postData._id;

    const body = {
      authorName,
      authorEmail,
      authorImage,
      postId,
      comment,
    };

    const response = await (
      await fetch(`${import.meta.env.VITE_SERVER_URL}/comments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
    ).json();

    if (response.success) {
      commentsRefetch();
      toast.success("Comment Added Successfully");
      e.target.reset();
    } else {
      toast.error(response.message);
    }

    setLoading(false);
  };

  return (
    <section>
      <Helmet>
        <title>{postData.title} | Chatter Box</title>
      </Helmet>
      <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
        <h3 className="text-2xl font-lato font-semibold">Post Details</h3>
      </header>

      {/* About Post */}
      <div className="flex gap-6 flex-col md:flex-row mb-4">
        {/* Post Details */}
        <div className="flex flex-col gap-6 md:w-3/5 h-min">
          <div className="rounded-md p-4 border-2 border-gray-700 dark:bg-gray-700 dark:text-gray-200 relative">
            <p className="text-2xl font-lato font-semibold mb-2 dark:text-white">
              {postData.title}
            </p>

            <p className="text-sm italic flex gap-3">
              {postData.tags.map((tag) => (
                <span key={tag}># {tag}</span>
              ))}
            </p>
            <p className="flex gap-2 items-center mb-5">
              <RiTimeFill /> {new Date(postData.createdAt).toLocaleString()}
            </p>
            <p className="my-3">{postData.description}</p>

            <div className="flex items-center gap-6">
              <span className="text-xl font-semibold font-lato">Author:</span>
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Avatar img={postData.authorImage} />
                <p>{postData.authorName}</p>
              </div>
            </div>
            <div className="divider m-2"></div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  className={`btn ${
                    userUpVoted ? "btn-neutral" : "btn-ghost"
                  } flex items-center gap-2`}
                  onClick={handleUpVote}
                >
                  <BiUpvote className="text-green-400" /> {postData.upVotes}
                </button>
                <button
                  className={`btn ${
                    userDownVoted ? "btn-neutral" : "btn-ghost"
                  } flex items-center gap-2`}
                  onClick={handleDownVote}
                >
                  <BiDownvote className="text-red-500" /> {postData.downVotes}
                </button>
              </div>
              <button
                className="btn btn-neutral flex items-center gap-2"
                onClick={() =>
                  document.getElementById("my_modal_1").showModal()
                }
              >
                <RiShareForward2Fill /> Share
              </button>
            </div>
          </div>
          {/* Add New Comments */}
          <div className="border-2 border-gray-700 dark:bg-gray-700 dark:text-gray-200 p-4 hidden md:block">
            <h4 className="text-xl sm:text-2xl font-bold font-lato mb-6 underline underline-offset-4">
              Add New Comment!
            </h4>

            <form className="space-y-5" onSubmit={handleSendComment}>
              <div>
                <label className="block text-sm font-medium dark:text-white">
                  Comment
                  <textarea
                    type="text"
                    name="comment"
                    className="mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-gray-400 h-32"
                    placeholder="Write your Comment"
                    required
                  />
                </label>
              </div>

              <Button
                color="blue"
                className="w-full"
                type="submit"
                disabled={userAuthData === null}
                pill
              >
                {loading ? (
                  <span className="loading"></span>
                ) : userAuthData ? (
                  "Add Comment"
                ) : (
                  "Login to Add Comment"
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Comments */}
        <div className="flex-grow p-4 rounded-lg border-2 border-gray-700 dark:bg-gray-700 dark:text-gray-200 md:w-2/5">
          <h4 className="text-xl font-semibold font-lato text-center p-3 bg-blue-400 text-white dark:bg-gray-600 border-b-2 border-blue-800 dark:border-gray-400 mb-5">
            Comments
          </h4>

          <div className="space-y-3">
            {commentsLoading ? (
              <p className="text-center py-2">
                <span className="loading loading-lg"></span>
              </p>
            ) : commentsData.result.length === 0 ? (
              <div className="text-center p-5 font-semibold">
                No Comments to Show!
              </div>
            ) : (
              commentsData.result.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 p-3 border border-gray-400 bg-gray-100 shadow-lg dark:bg-slate-700 dark:text-white"
                >
                  <Avatar img={item.authorImage} />
                  <div>
                    <div className="flex flex-wrap items-center mb-1">
                      <h3 className="font-semibold dark:text-white">
                        {item.authorName}
                      </h3>
                      <p className="text-lg mx-2">•</p>
                      <p>{moment(item.createdAt).fromNow()}</p>
                    </div>
                    <p>{item.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add New Comments */}
      <div className="border-2 border-gray-700 dark:bg-gray-700 dark:text-gray-200 p-4 md:hidden">
        <h4 className="text-xl sm:text-2xl font-bold font-lato mb-6 underline underline-offset-4">
          Add New Comment!
        </h4>

        <form className="space-y-5" onSubmit={handleSendComment}>
          <div>
            <label className="block text-sm font-medium dark:text-white">
              Comment
              <textarea
                type="text"
                name="comment"
                className="mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-gray-400 h-32"
                placeholder="Write your Comment"
                required
              />
            </label>
          </div>

          <Button
            color="blue"
            className="w-full"
            type="submit"
            disabled={userAuthData === null}
            pill
          >
            {loading ? (
              <span className="loading"></span>
            ) : userAuthData ? (
              "Add Comment"
            ) : (
              "Login to Add Comment"
            )}
          </Button>
        </form>
      </div>

      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="text-2xl font-semibold mb-3 text-center">
            Share in Social Media
          </h3>
          <div className="flex justify-center gap-4">
            <div>
              <FacebookShareButton
                url={`${window.location.origin}/posts/${postData._id}`}
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
            </div>
            <div>
              <WhatsappShareButton
                url={`${window.location.origin}/posts/${postData._id}`}
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
            </div>

            <div>
              <TelegramShareButton
                url={`${window.location.origin}/posts/${postData._id}`}
              >
                <TelegramIcon size={32} round />
              </TelegramShareButton>
            </div>
          </div>
          <div className="divider"></div>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </section>
  );
};

export default PostDetails;
