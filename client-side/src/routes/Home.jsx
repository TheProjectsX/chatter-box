import { Fragment, useEffect, useMemo, useState } from "react";
import bannerImage from "../assets/banner.jpg";

import { IoSearchSharp } from "react-icons/io5";
import { FaRegComment } from "react-icons/fa";
import { BiUpvote, BiDownvote } from "react-icons/bi";
import { IoIosTimer } from "react-icons/io";

import Select from "react-select";
import { Avatar, Pagination } from "flowbite-react";

import moment from "moment";
import { Link, useLoaderData } from "react-router-dom";
import { Helmet } from "react-helmet";

const Home = () => {
  const { announcements, posts: initialPostsData, tags } = useLoaderData();
  const [posts, setPosts] = useState(initialPostsData);

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [pageLoading, setPageLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortedByVote, setSortedByVote] = useState(false);
  const [sortLoading, setSortLoading] = useState(false);

  const [searchValue, setSearchValue] = useState({
    label: "Select Tag",
    value: "",
  });

  const popularTopic = useMemo(
    () => tags.result.sort(() => 0.5 - Math.random()).slice(0, 3),
    [tags]
  );
  const tagsOptions = useMemo(
    () =>
      [{ tag: "All" }, ...tags.result].map((item) => ({
        value: item.tag,
        label: item.tag,
      })),
    [tags]
  );

  useEffect(() => {
    if (posts && posts.count !== undefined) {
      const count = posts.count < itemsPerPage ? itemsPerPage : posts.count;
      setTotalPages(Math.ceil(count / itemsPerPage));
    }
  }, [posts]);

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      const skip = itemsPerPage * (currentPage - 1);
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/posts?tag=${
          searchValue.value === "All" ? "" : searchValue.value
        }&skip=${skip}&limit=${itemsPerPage}`
      );

      const data = await res.json();
      setPosts(data);
      setPageLoading(false);
      setSortedByVote(false);
    };
    loadData();
  }, [currentPage]);

  const handleSearch = async (tag) => {
    setSearchLoading(true);
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/posts?tag=${
        tag === "All" ? "" : tag
      }&limit=${itemsPerPage}`
    );
    const data = await res.json();

    setPosts(data);
    setSearchLoading(false);
  };

  const handleSort = async () => {
    setSortLoading(true);
    const sortByVote = sortedByVote ? "false" : "true";
    const skip = itemsPerPage * (currentPage - 1);
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/posts?tag=${
        searchValue.value === "All" ? "" : searchValue.value
      }&skip=${skip}&limit=${itemsPerPage}&sortByVote=${sortByVote}`
    );
    const data = await res.json();
    setPosts(data);
    setSortedByVote(!sortedByVote);
    setSortLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Home | Chatter Box</title>
      </Helmet>
      {/* Banner */}
      <section className="w-full relative">
        <img src={bannerImage} alt="Banner Image" className="w-full" />
        <div className="flex flex-col justify-center items-center absolute top-0 left-0 bottom-0 right-0 bg-black/50">
          <p className="text-white text-xl font-semibold mb-2">
            Search via Tags
          </p>
          <form
            className="flex items-center gap-3 text-black mb-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchValue.value);
            }}
          >
            <Select
              className="basic-single w-40 sm:w-72"
              classNamePrefix="select"
              defaultValue={{ label: "Select Tag", value: "" }}
              isSearchable={false}
              name="tag"
              options={tagsOptions}
              value={searchValue}
              onChange={(value) => setSearchValue(value)}
            />

            <button
              className="btn btn-circle btn-info text-2xl text-white"
              type="submit"
              name="submitBtn"
              disabled={searchLoading}
            >
              {searchLoading ? (
                <span className="loading"></span>
              ) : (
                <IoSearchSharp />
              )}
            </button>
          </form>
          <div className="*:font-semibold *:text-white text-sm sm:text-base">
            Recent Searches:{" "}
            {popularTopic.map((item, index) => (
              <Fragment key={index}>
                <span
                  key={item._id}
                  onClick={() => {
                    setSearchValue({ value: item.tag, label: item.tag });
                    handleSearch(item.tag);
                  }}
                  className="cursor-pointer"
                >
                  {item.tag}
                </span>
                {index < popularTopic.length - 1 && ", "}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section>
        <header className="text-center mb-6">
          <h3 className="font-semibold font-lato text-2xl underline underline-offset-4 dark:text-white mb-3">
            Posts
          </h3>

          <div>
            <button className="btn" onClick={handleSort} disabled={sortLoading}>
              {sortLoading ? (
                <span className="loading"></span>
              ) : sortedByVote ? (
                "Sort by Time"
              ) : (
                "Sort by Votes"
              )}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-between mb-5">
          {posts.result.map((post) => (
            <Link
              to={`/posts/${post._id}`}
              key={post._id}
              className="flex gap-4 p-3 rounded-lg shadow-lg border border-gray-700 dark:bg-gray-700 active:scale-95 transition-[transform]"
            >
              <div>
                <Avatar img={post.authorImage} alt={post.authorName} />
              </div>
              <div className="w-full">
                <p className="text-lg sm:text-xl dark:text-white font-semibold font-lato">
                  {post.title}
                </p>
                <div className="flex gap-2 italic text-sm">
                  {post.tags.map((tag) => (
                    <span key={tag}># {tag}</span>
                  ))}
                </div>
                <div className="divider my-2"></div>
                <div className="flex items-center gap-2 flex-wrap justify-between">
                  <div className="flex gap-3.5 items-center">
                    <p className="flex gap-1.5 items-center">
                      <FaRegComment /> {post.commentsCount}
                    </p>
                    <p className="flex gap-1.5 items-center">
                      {" "}
                      <BiUpvote className="text-green-400" /> {post.upVotes}
                    </p>
                    <p className="flex gap-1.5 items-center">
                      <BiDownvote className="text-red-500" /> {post.downVotes}
                    </p>
                  </div>

                  <p className="flex gap-1.5 items-center">
                    <IoIosTimer /> {moment(post.createdAt).fromNow()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
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

      {/* Tags */}
      <section>
        <header className="text-center mb-6">
          <h3 className="font-semibold font-lato text-2xl underline underline-offset-4 dark:text-white mb-3">
            Post Tags
          </h3>
          <p>Here are the Tags we Offer</p>
        </header>

        <div className="flex gap-4 flex-wrap justify-center">
          {tags.result.map((tag) => (
            <div
              key={tag._id}
              className="p-3 shadow-lg border border-gray-700 dark:bg-gray-700 rounded-md flex gap-2 active:scale-95 transition-[transform] cursor-pointer"
              onClick={() => {
                setSearchValue({ value: tag.tag, label: tag.tag });
                handleSearch(tag.tag);
              }}
              title="View Posts"
            >
              {tag.tag}

              <div className="badge badge-neutral">{tag.postCount}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements */}
      {announcements.result.length > 0 && (
        <section>
          <header className="text-center mb-6">
            <h3 className="font-semibold font-lato text-2xl underline underline-offset-4 dark:text-white mb-3">
              Announcements
            </h3>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {announcements.result.map((item) => (
              <div
                key={item._id}
                className="p-4 shadow-lg border border-gray-700 dark:bg-gray-700 rounded-md"
              >
                <h4 className="text-lg sm:text-2xl dark:text-white font-semibold font-lato italic mb-2">
                  {item.title}
                </h4>
                <p>{item.description}</p>
                <div className="divider my-3"></div>
                <div className="flex justify-center items-center gap-3">
                  <Avatar
                    img={item.authorImage}
                    alt={item.authorName}
                    rounded
                  />
                  <p>{item.authorName}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
