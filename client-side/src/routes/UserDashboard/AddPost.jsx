import { Button } from "flowbite-react";
import { useContext, useState } from "react";
import { UserAuthDataContext, UserDataContext } from "../../context/context";

import { toast } from "react-toastify";
import { Link, useLoaderData } from "react-router-dom";
import { Helmet } from "react-helmet";

const AddPost = () => {
  const [pastPostsData, tagsData] = useLoaderData();
  const [postsCount, setPostsCount] = useState(pastPostsData.count);

  const authContext = useContext(UserAuthDataContext);
  const { userAuthData, userData } = authContext;

  const dataContext = useContext(UserDataContext);
  const { statsRefetch } = dataContext;

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;

    const title = form.title.value;
    const tags = [form.tag.value];
    const description = form.description.value;
    const createdAt = new Date().toJSON();

    const authorEmail = userAuthData.email;
    const authorName = userAuthData.displayName;
    const authorImage = userAuthData.photoURL;

    const body = {
      authorEmail,
      authorName,
      authorImage,
      title,
      tags,
      description,
      createdAt,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/posts`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Post Added Successfully!");
        statsRefetch();
        setPostsCount(postsCount + 1);
        form.reset();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to add Post");
      console.log(error);
    }

    setLoading(false);
  };

  if (userData.membershipStatus !== "Premium" && postsCount >= 5) {
    return (
      <section>
        <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
          <h3 className="text-2xl font-lato font-semibold">Add new Post</h3>
        </header>
        <div className="text-center py-6">
          <h4 className="text-2xl font-semibold mb-2 dark:text-white">
            Post Creation Limit Reached!
          </h4>
          <p>You can Only Create 5 Posts with Free Membership</p>
          <Link to="/membership" className="btn btn-link">
            Become a Premium Member
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <Helmet>
        <title>Add new Post | User Dashboard</title>
      </Helmet>
      <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
        <h3 className="text-2xl font-lato font-semibold">Add new Post</h3>
      </header>

      <form className="px-2 sm:px-8 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium dark:text-white">
              Post Title <span className="text-red-600">*</span>
              <input
                type="text"
                name="title"
                className="mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-gray-400"
                placeholder="Your Post Title..."
                required
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-white">
              Tag <span className="text-red-600">*</span>
              <select
                name="tag"
                className="mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-gray-400"
              >
                {tagsData.result.map((item) => (
                  <option key={item._id} value={item.tag}>
                    {item.tag}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-white">
            Post Description <span className="text-red-600">*</span>
            <textarea
              type="text"
              name="description"
              className="mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-gray-400 min-h-40"
              placeholder="Your Post Description..."
              required
            />
          </label>
        </div>

        <div className="pt-5">
          <Button
            color="blue"
            className="w-full"
            type="submit"
            disabled={loading}
            pill
          >
            {loading ? <span className="loading"></span> : "Add Post"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default AddPost;
