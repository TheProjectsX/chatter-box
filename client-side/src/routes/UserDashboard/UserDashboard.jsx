import { PiSignpostBold } from "react-icons/pi";
import { FaRegComment } from "react-icons/fa";
import { useContext } from "react";
import { UserDataContext } from "../../context/context";
import { Helmet } from "react-helmet";

const UserDashboard = () => {
  const context = useContext(UserDataContext);
  const { statsData, statsLoading } = context;

  return (
    <section>
      <Helmet>
        <title>User Dashboard</title>
      </Helmet>
      <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
        <h3 className="text-2xl font-lato font-semibold mb-2">Dashboard</h3>
      </header>

      <h3 className="text-xl font-semibold underline underline-offset-4 mb-6">
        Your Stats:{" "}
      </h3>
      <div className="stats flex justify-center">
        {statsLoading ? (
          <div className="loading loading-lg"></div>
        ) : (
          <>
            <div className="stat bg-slate-200 dark:bg-slate-800 w-fit">
              <div className="stat-figure text-primary">
                <PiSignpostBold />
              </div>
              <div className="stat-title">Total Posts</div>
              <div className="stat-value text-primary">
                {statsData?.postsCount}
              </div>
            </div>
            <div className="stat bg-slate-200 dark:bg-slate-800 w-fit">
              <div className="stat-figure text-primary">
                <FaRegComment />
              </div>
              <div className="stat-title">Total Comments</div>
              <div className="stat-value text-primary">
                {statsData?.commentsCount}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default UserDashboard;
