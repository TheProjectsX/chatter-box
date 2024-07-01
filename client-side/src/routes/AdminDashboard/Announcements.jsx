import { Button } from "flowbite-react";
import { useContext, useState } from "react";
import { UserAuthDataContext } from "../../context/context";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";

const Announcements = () => {
  const [loading, setLoading] = useState(false);

  const authContext = useContext(UserAuthDataContext);
  const { userAuthData, forceUpdate } = authContext;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;

    const title = form.title.value;
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
      description,
      createdAt,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/announcements`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();

      if (data.success) {
        toast.success("Announcement Created Successfully!");
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

  return (
    <section>
      <Helmet>
        <title>Announcements | Admin Dashboard</title>
      </Helmet>
      <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
        <h3 className="text-2xl font-lato font-semibold">Make Announcements</h3>
      </header>

      <form className="px-2 sm:px-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium dark:text-white">
            Announcement Title <span className="text-red-600">*</span>
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
            Announcement Description <span className="text-red-600">*</span>
            <textarea
              type="text"
              name="description"
              className="mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-gray-400 min-h-36"
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
            {loading ? (
              <span className="loading"></span>
            ) : (
              "Create Announcement"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default Announcements;
