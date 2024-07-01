import { useContext, useState } from "react";
import { AdminDataContext, UserAuthDataContext } from "../../context/context";
import { HiBadgeCheck } from "react-icons/hi";
import { LuUsers } from "react-icons/lu";
import { PiSignpostBold } from "react-icons/pi";
import { FaRegComment } from "react-icons/fa";

import { PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);

  const userContext = useContext(UserAuthDataContext);
  const { userAuthData, userData } = userContext;

  const dataContext = useContext(AdminDataContext);
  const { statsData, statsLoading } = dataContext;

  const chartData = [
    { name: "Posts Count", value: statsData?.postsCount },
    { name: "Comments Count", value: statsData?.commentsCount },
    { name: "Users Count", value: statsData?.usersCount },
  ];

  const handleAddTag = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tag = e.target.tag.value;
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/admin/tags`, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ tag: tag }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Tag Added");
      e.target.reset();
    } else {
      toast.error(data.message);
    }
    setLoading(false);
  };

  return (
    <section className="space-y-10">
      <Helmet>
        <title>Admin Dashboard</title>
      </Helmet>
      <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
        <h3 className="text-2xl font-lato font-semibold">Admin Dashboard</h3>
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
                userData.badge === "gold" ? "text-[#FFD700]" : "text-[#CD7F32]"
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

      {/* States */}
      <div>
        <h3 className="text-xl font-semibold underline underline-offset-4 mb-6">
          Website Stats:{" "}
        </h3>

        {statsLoading ? (
          <div className="text-center py-4">
            <span className="loading loading-lg"></span>
          </div>
        ) : (
          <div className="flex gap-2 justify-evenly sm:flex-row flex-col">
            <div className="flex sm:flex-col sm:justify-center flex-wrap [&_>*:not(last-child)]:border-b-2">
              <div className="stat bg-slate-200 dark:bg-slate-800">
                <div className="stat-figure text-primary">
                  <PiSignpostBold />
                </div>
                <div className="stat-title">Total Posts</div>
                <div className="stat-value text-primary">
                  {statsData?.postsCount}
                </div>
              </div>
              <div className="stat bg-slate-200 dark:bg-slate-800">
                <div className="stat-figure text-primary">
                  <FaRegComment />
                </div>
                <div className="stat-title">Total Comments</div>
                <div className="stat-value text-primary">
                  {statsData?.commentsCount}
                </div>
              </div>
              <div className="stat bg-slate-200 dark:bg-slate-800">
                <div className="stat-figure text-primary">
                  <LuUsers />
                </div>
                <div className="stat-title">Total Users</div>
                <div className="stat-value text-primary">
                  {statsData?.usersCount}
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <PieChart width={300} height={300}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </div>
          </div>
        )}
      </div>

      {/* Add Tags */}
      <div>
        <h3 className="text-xl font-semibold underline underline-offset-4 mb-6">
          Add New Tags:{" "}
        </h3>

        <form
          onSubmit={handleAddTag}
          className="flex gap-3 items-end px-2 sm:px-8 mb-10"
        >
          <div className="flex-grow">
            <label className="block text-sm font-medium dark:text-white">
              Enter Tag:
              <input
                type="text"
                name="tag"
                className="mt-2 border-2 outline-none sm:text-sm rounded-lg block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-gray-400"
                placeholder="Enter a Tag to Add..."
                required
              />
            </label>
          </div>

          <button className="btn btn-info" type="submit" disabled={loading}>
            {loading ? <span className="loading"></span> : "Add Tag"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminDashboard;
