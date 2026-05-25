import { lazy, Suspense, useEffect } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import AuthContainer from "@/features/auth/auth-container";
import LoginContainer from "@/features/auth/login/LoginContainer";
import SignUpContainer from "@/features/auth/signup/SignUpContainer";
import AppContainer from "@/layouts/app-container";
import userAuthStore from "@/core/store/user-auth-store";
import { handleCheckAuth } from "@/core/utils/authFunction";
import HomePageContainer from "@/pages/home/HomePage";
import ChatsContainer from "@/features/chat/chat-container";
import MomentsContainer from "@/features/moments/momments-container";
import ConnectionsContainer from "@/features/connections/connections-container";
import SpacesContainer from "@/features/spaces/spaces-container";
import {
  handleEventAdd,
  handleEventRemove,
  handleEventUpdate,
} from "@/core/socket/socket-handler";

import MessageContainer, {
  NoConversationSelectedUI,
} from "@/features/chat/message/message-container";
import RouteNotFound from "@/components/ui/not-found";
import { handleSyncAdd, handleSyncRemove, handleSyncUpdate } from "@/core/socket/sync/sync";

const LoadingAppUI = lazy(() => import("@/layouts/loading-ui"));

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

