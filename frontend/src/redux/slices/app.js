import { createSlice } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

// Firebase
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "../../firebase";
import { FetchConversations, toggleUpdated } from "./conversation";
const storage = getStorage(app);
const metadata = {
  contentType: 'image/jpeg'
};

// ----------------------------------------------------------------------

const initialState = {
  user: {},
  sideBar: {
    open: false,
    type: "CONTACT", // can be CONTACT, STARRED, SHARED
  },
  isLoggedIn: true,
  isLoading: false,
  error: false,
  tab: 0, // [0, 1, 2, 3]
  snackbar: {
    open: null,
    severity: null,
    message: null,
  },
  chats: [], // all chats of user
  notifications: [], // all notificatons of user
  users: [], // all users of app
  isGroupChat: false,
  chat_id: null,
  selectedChat: {},
  commonGroups: []
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // User Related
    updateUser(state, action) {
      state.user = action.payload.user;
    },
    updateChats(state, action) {
      state.chats = action.payload.chats;
    },
    updateUsers(state, action) {
      state.users = action.payload.users;
    },

    // Change Conversation room
    selectConversation(state, action) {
      state.isGroupChat = action.payload.isGroupChat;
      state.chat_id = action.payload.chat_id;
      state.selectedChat = action.payload.chat;
    },

    // Change 
    updateLatestMessage(state, action) {
      state.selectedChat = action.payload.chat;
    },

    updateCommonGroups(state, action) {
      state.commonGroups = action.payload.groups;
    },

    // Change 
    pushNewNotification(state, action) {
      state.notifications = [action.payload.notification, ...state.notifications];
    },

    // Toggle Sidebar
    toggleSideBar(state) {
      state.sideBar.open = !state.sideBar.open;
    },
    updateSideBarType(state, action) {
      state.sideBar.type = action.payload.type;
    },

    // Tab
    updateTab(state, action) {
      state.tab = action.payload.tab;
    },

    // Snackbar
    openSnackBar(state, action) {
      console.log(action.payload);
      state.snackbar.open = true;
      state.snackbar.severity = action.payload.severity;
      state.snackbar.message = action.payload.message;
    },
    closeSnackBar(state) {
      // console.log("This is getting executed");
      state.snackbar.open = false;
      state.snackbar.message = null;
    },

    updateIsLoading(state, action) {
      state.error = action.payload.error;
      state.isLoading = action.payload.isLoading;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------


// Snackbar
export const closeSnackBar = () => async (dispatch, getState) => {
  dispatch(slice.actions.closeSnackBar());
};
export const showSnackbar = ({ severity, message }) => async (dispatch, getState) => {
  dispatch(
    slice.actions.openSnackBar({
      message,
      severity,
    })
  );

  setTimeout(() => {
    dispatch(slice.actions.closeSnackBar());
  }, 4000);
};


// Sidebar
export function ToggleSidebar() {
  return async (dispatch, getState) => {
    dispatch(slice.actions.toggleSideBar());
  };
}
export function UpdateSidebarType(type) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateSideBarType({ type }));
  };
}

// Tab
export function UpdateTab(tab) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateTab(tab));
  };
}


// User
export function FetchChats() {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    await axios.get(
      "/chat", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getState().auth.token}`,
      },
    }).then((response) => {
      console.log(response);
      dispatch(slice.actions.updateChats({ chats: response.data }));
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
    }).catch((err) => {
      console.log(err);
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: true }));
    });
  };
}

export function FetchCommonGroups({ user_id }) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    await axios.get(
      `/chat/common/${user_id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getState().auth.token}`,
      },
    }).then((response) => {
      console.log(response);
      dispatch(slice.actions.updateCommonGroups({ groups: response.data }));
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
    }).catch((err) => {
      console.log(err);
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: true }));
    });
  };
}

export function EmptyCommonGroups() {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateCommonGroups({ groups: [] }));
  };
}

export const SelectConversation = ({ chat_id, isGroupChat }) => {
  return async (dispatch, getState) => {
    axios.get(
      `/chat/${chat_id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getState().auth.token}`,
      },
    }).then((response) => {
      console.log(response);
      if (!response.data.isGroupChat) {
        response.data.chatName = response.data.users[0].firstName + " " + response.data.users[0].lastName;
      }
      dispatch(slice.actions.selectConversation({ chat_id, isGroupChat, chat: response.data }));
      // dispatch(FetchConversations());
    }).catch((err) => {
      console.log(err);
    });
  };
};

export const FetchUserProfile = () => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    axios.get(
      "/user/get-me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getState().auth.token}`,
      },
    }).then((response) => {
      console.log(response);
      dispatch(slice.actions.updateUser({ user: response.data.data }));
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
    }).catch((err) => {
      console.log(err);
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: true }));
    });
  };
};

export const UpdateUserProfile = (formValues) => {

  return async (dispatch, getState) => {

    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

    if (formValues.isPictureModified) {
      const file = formValues.avatar;
      const fileName = new Date().getTime() + file.name.trim().split(" ").join("");
      const storageRef = ref(storage, "profilePic/" + fileName);

      uploadBytes(storageRef, file, metadata).then(
        (snapshot) => {
          getDownloadURL(snapshot.ref).then((downloadURL) => {
            axios.patch(
              "/user/update-me", {
              ...formValues,
              avatar: downloadURL
            }, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getState().auth.token}`,
              },
            }
            ).then((response) => {
              console.log(response);
              dispatch(slice.actions.updateUser({ user: response.data.data }));
              dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
            })
          });
        },
        (error) => {
          console.log(error);
          dispatch(slice.actions.updateIsLoading({ isLoading: false, error: true }));
        }
      );
    }
    else {
      axios.patch(
        "/user/update-me", {
        ...formValues
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getState().auth.token}`,
        },
      }).then((response) => {
        console.log(response);
        dispatch(slice.actions.updateUser({ user: response.data.data }));
        dispatch(showSnackbar({ severity: "success", message: "Updated Successfully!" }));
        dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
      }).catch((err) => {
        console.log(err);
        dispatch(showSnackbar({ severity: "error", message: err.message }));
        dispatch(slice.actions.updateIsLoading({ isLoading: false, error: true }));
      });
    }
  };
};


export const FetchUsers = () => {
  return async (dispatch, getState) => {
    axios.get(
      "/user/get-users", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getState().auth.token}`,
      },
    }).then((response) => {
      console.log(response);
      dispatch(slice.actions.updateUsers({ users: response.data.data }));
    }).catch((err) => {
      console.log(err);
    });
  };
};


export const StartConversation = ({ _id }) => {
  return async (dispatch, getState) => {
    console.log(_id);
    axios.post(
      "/chat", {
      "userId": _id
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getState().auth.token}`,
      },
    }).then((response) => {
      console.log(response);
      dispatch(SelectConversation({ chat_id: response.data._id, isGroupChat: false }))
      dispatch(FetchChats())
      // dispatch(slice.actions.selectConversation({ chat_id: response.data._id, isGroupChat: false, chat: response.data }));
    }).catch((err) => {
      console.log(err);
    });
  };
};

export const StartGroupConversation = ({ data }) => {
  return async (dispatch, getState) => {
    console.log(data);
    const members = JSON.stringify(data.members.map((memb) => memb._id));
    console.log(members)
    axios.post(
      "/chat/group", {
      name: data.title,
      users: members,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getState().auth.token}`,
      },
    }).then((response) => {
      console.log(response);
      dispatch(SelectConversation({ chat_id: response.data._id, isGroupChat: true }))
      dispatch(FetchChats())
      // dispatch(slice.actions.selectConversation({ chat_id: response.data._id, isGroupChat: false, chat: response.data }));
    }).catch((err) => {
      console.log(err);
    });
  };
};

export function newNotification(notification) {
  return async (dispatch, getState) => {
    // if (!(getState().conversations.isUpdated)) {
    dispatch(slice.actions.pushNewNotification({ notification: notification }));
    // dispatch(toggleUpdated({ value: true }));
    // }
  };
}