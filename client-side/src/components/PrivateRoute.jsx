import { useContext } from "react";
import { UserAuthDataContext } from "../context/context";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner } from "flowbite-react";

const PrivateRoute = ({ children, reverse = false }) => {
  const context = useContext(UserAuthDataContext);
  const { userAuthData, dataLoading } = context;
  const location = useLocation();

  if (dataLoading) {
    return (
      <div className="flex justify-center p-5">
        <Spinner aria-label="Loading Data" />
      </div>
    );
  }

  if (!userAuthData && !reverse) {
    return (
      <div className="flex justify-center p-5">
        <Spinner aria-label="Loading Data" />
        <Navigate to={"/login"} replace={true} state={location.pathname} />
      </div>
    );
  }
  if (userAuthData && reverse) {
    return (
      <div className="flex justify-center p-5">
        <Spinner aria-label="Loading Data" />
        <Navigate to={location.state ? location.state : "/"} replace={true} />
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
