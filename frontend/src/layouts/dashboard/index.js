import React, { useEffect } from "react";
import { Stack } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import useResponsive from "../../hooks/useResponsive";
import SideNav from "./SideNav";
import { useSelector } from "react-redux";
import { connectSocket, socket } from "../../socket";

const DashboardLayout = () => {

  const isDesktop = useResponsive("up", "md");
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { user_id } = useSelector((state) => state.app);
  const { user } = useSelector((state) => state.app);
  const { isSocketConnected } = useSelector((state) => state.conversation);

  useEffect(() => {
    window.onload = function () {
      if (!window.location.hash) {
        window.location = window.location + "#loaded";
        window.location.reload();
      }
    };
    if (!isLoggedIn) {
      window.onload();
    }
  }, [isLoggedIn, user_id, user]);


  useEffect(() => {
    if (!socket || !isSocketConnected) {
      connectSocket();
      socket.emit("setup", user)
      socket.on("connected to app", () => console.log("Online"))
    }

    return () => {
      socket?.emit("Disconnect");
    }
  }, [isLoggedIn, user_id, user, isSocketConnected]);


  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;
  }

  return (
    <>
      <Stack direction="row">
        {isDesktop && (
          // SideBar
          <SideNav />
        )}
        <Outlet />
      </Stack>
    </>
  );
};

export default DashboardLayout;
