import { lazy, Suspense, useEffect } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import AuthContainer from "./pages/auth/auth-container";
import LoginContainer from "./pages/auth/login/loginContainer";
import SignUpContainer from "./pages/auth/signup/signUpContainer";
import AppContainer from "./app/app-container";
import userAuthStore from "./store/user-auth-store";
import { handleCheckAuth } from "./functions/authFunction";
import HomePageContainer from "./pages/home-page/home-page-container";
import ChatsContainer from "./app/chat/chat-container";
import MomentsContainer from "./app/moment/momments-container";
import ConnectionsContainer from "./app/connections/connections-container";
import SpacesContainer from "./app/spaces/spaces-container";
import {
  handleEventAdd,
  handleEventRemove,
  handleEventUpdate,
} from "./utils/socket-listener/socket-handler";

import MessageContainer, {
  NoConversationSelectedUI,
} from "./app/chat/message/message-container";
import RouteNotFound from "./app/components/ui/not-found";
import { handleSyncAdd, handleSyncRemove, handleSyncUpdate } from "./utils/socket-listener/sync/sync";

const LoadingAppUI = lazy(() => import("./app/loading-app-container"));

const App = () => {
  const authUser = userAuthStore((state) => state.authUser);
  const isCheckingAuth = userAuthStore((state) => state.isCheckingAuth);
  const isPoolingReconnection = userAuthStore(
    (state) => state.isPoolingReconnection,
  );

  const socket = userAuthStore((state) => state.socket);

  useEffect(() => {
    handleCheckAuth();
  }, [handleCheckAuth]);

  useEffect(() => {
    if (!socket || !authUser) return;

    socket.on("EVENT:ADD", handleEventAdd);
    socket.on("EVENT:REMOVE", handleEventRemove);
    socket.on("SYNC:REMOVE", handleSyncRemove);
    socket.on("SYNC:ADD", handleSyncAdd);
    socket.on("SYNC:UPDATE", handleSyncUpdate)
    socket.on("EVENT:UPDATE", handleEventUpdate)

    return () => {
      if (!socket) return;

      socket.off("EVENT:ADD", handleEventAdd);
      socket.off("EVENT:REMOVE", handleEventRemove);
      socket.off("SYNC:REMOVE", handleSyncRemove);
      socket.off("SYNC:ADD", handleSyncAdd);
      socket.off("SYNC:UPDATE", handleSyncUpdate)
      socket.off("EVENT:UPDATE", handleEventUpdate)
    };
  }, [socket, authUser]);


  console.log(
    "%cCAUGHT YOU!%c\n\n Why snitching just follow me on Linkedin --> https://www.linkedin.com/in/jacob-messiah/",
    "color: red; font-size: 35px; font-weight: bold;",
    "font-size: 12px;",
  );

  if (isCheckingAuth || isPoolingReconnection) {
    return (
      <Suspense>
        <LoadingAppUI />
      </Suspense>
    );
  }

  return (
    <div>
      <Toaster richColors position="top-center" />
      <Routes>
        {/* Public home page */}
        <Route path="/" element={<HomePageContainer />} />

        {/* App routes - protected */}
        <Route
          path="/app"
          element={authUser ? <AppContainer /> : <Navigate to="/auth" />}
        >
          <Route path="moments" element={<MomentsContainer />} />
          <Route path="connections" element={<ConnectionsContainer />} />
          <Route path="spaces" element={<SpacesContainer />} />
          <Route path="chat" element={<ChatsContainer />}>
            <Route index element={<NoConversationSelectedUI />} />
            <Route path=":id" element={<MessageContainer />} />
          </Route>
        </Route>

        {/* Auth routes */}
        <Route
          path="/auth"
          element={
            authUser ? <Navigate replace to="/app" /> : <AuthContainer />
          }
        >
          <Route index element={<LoginContainer />} />
          <Route path="signup" element={<SignUpContainer />} />
        </Route>

        {/* 404 For now  */}
        <Route path="*" element={<RouteNotFound />} />
      </Routes>
    </div>
  );
};

export default App;
