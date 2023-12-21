import React, { useEffect } from "react";
import * as Yup from "yup";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  Typography,
} from "@mui/material";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import FormProvider from "../../components/hook-form/FormProvider";
import { RHFTextField } from "../../components/hook-form";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";
import { useDispatch, useSelector } from "react-redux";
import { FetchUsers, StartGroupConversation } from "../../redux/slices/app";
import { styled, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const StyledChatBox = styled(Box)(({ theme }) => ({
  "&:hover": {
    cursor: "pointer",
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateGroupForm = ({ handleClose }) => {
  const NewGroupSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    members: Yup.array().min(2, "Must have at least 2 members"),
  });

  const defaultValues = {
    title: "",

    tags: [],
  };

  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.app);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    dispatch(FetchUsers());
  }, []);

  const methods = useForm({
    resolver: yupResolver(NewGroupSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await dispatch(StartGroupConversation({ data })).then(
        handleClose()
      ).then(
        navigate("/group")
      )
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="title" label="Title" />
        <RHFAutocomplete
          name="members"
          label="Members"
          multiple
          freeSolo
          options={users}
          list={users}
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <StyledChatBox
                sx={{
                  width: "100%",
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.paper,
                }}
                p={1}
              >
                <Stack
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems={"center"} spacing={2}>
                    {" "}

                    <Avatar alt={option.firstName + " " + option.lastName} src={option.avatar} />
                    <Stack spacing={0.3}>
                      <Typography variant="subtitle2">{option.firstName + " " + option.lastName}</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </StyledChatBox>
            </li>
          )}
          ChipProps={{ size: "medium" }}
        />
        <Stack
          spacing={2}
          direction={"row"}
          alignItems="center"
          justifyContent={"end"}
        >
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Create
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

const CreateGroup = ({ open, handleClose }) => {
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      sx={{ p: 4 }}
    >
      <DialogTitle>{"Create New Group"}</DialogTitle>

      <DialogContent sx={{ mt: 4 }}>
        {/* Create Group Form */}
        <CreateGroupForm handleClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
