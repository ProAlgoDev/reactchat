import React, { useEffect } from "react";
import { Box, Container, Stack } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";

import { useSelector } from "react-redux";
import Logo from "../../components/Logo";


const AuthLayout = () => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  if (isLoggedIn) {
    return <Navigate to={"/app"} />;
  }

  return (
    <>
      <Container sx={{ mt: 5 }} maxWidth="sm">
        <Stack spacing={5}>
          <Stack
            sx={{ width: "100%" }}
            direction="column"
            alignItems={"center"}
          >
            <Box
              sx={{
                height: 120,
                width: 120,
                backgroundColor: "transparent",
              }}
            >
              <Logo />
            </Box>
          </Stack>
          <Outlet />
        </Stack>
      </Container>
    </>
  );
};

export default AuthLayout;
