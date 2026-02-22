import { Navigate } from "react-router-dom";


const HomePageContainer = () => {

  //  Changed Navigation to App because homepage hasn't been made yet 

  return (
    <Navigate to="/app" />
  );
};
export default HomePageContainer;
