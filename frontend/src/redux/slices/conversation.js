import { createSlice } from "@reduxjs/toolkit";

import axios from "../../utils/axios";
import { showSnackbar } from "./app";
import convertTimeStamp from "../../utils/convertTimeStamp";
import { socket } from "../../socket";

const initialState = {
  conversations: [],
  curChat: {},
  isLoading: false,
  isTyping: false,
  isSocketConnected: false,
  error: false,
  isGroupChat: false,
  isUpdated: false,
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    updateConversations(state, action) {
      state.conversations = action.payload.conversations;
    },
    pushNewConversation(state, action) {
      state.conversations = [...state.conversations, action.payload.chat];
    },
    updateIsLoading(state, action) {
      state.error = action.payload.error;
      state.isLoading = action.payload.isLoading;
    },
    toggleTyping(state, action) {
      state.isTyping = action.payload.value;
    },
    toggleSocket(state, action) {
      state.isSocketConnected = action.payload.value;
    },
    toggleUpdated(state, action) {
      state.isUpdated = action.payload.value;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------
export function FetchConversations() {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    await axios.get(
      `/message/${getState().app.chat_id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getState().auth.token}`,
      },
    }).then((response) => {
      console.log(response);
      dispatch(slice.actions.updateConversations({ conversations: response.data }));
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
    }).catch((err) => {
      console.log(err);
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: true }));
    });
  };
}

export function toggleTyping(value) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.toggleTyping({ value: value }));
  }
}

export function toggleSocket(value) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.toggleSocket({ value: value }));
  }
}
const linkify = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
}

const containsUrl = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
}

export function sendMessage(content) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    socket.emit("stop typing", getState().app.chat_id);
    // if(convertTimeStamp((slice.conversations.at(-1)).createdAt) === "Yesterday"){

    // }

    const type = containsUrl(content) ? "Link" : "Text";
    content = linkify(content);
    await axios.post(
      `/message`, {
      content: content,
      type: type,
      chatId: getState().app.chat_id,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getState().auth.token}`,
      },
    }).then((response) => {
      console.log(response);
      dispatch(slice.actions.pushNewConversation({ chat: response.data }));
      socket.emit("new message", response.data);
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: false }));
    }).catch((err) => {
      console.log(err);
      dispatch(slice.actions.updateIsLoading({ isLoading: false, error: true }));
      dispatch(
        showSnackbar({ severity: "error", message: err.message })
      );
    });
  };
}

export function messageReceived(mess) {
  return async (dispatch, getState) => {
    if (!(getState().conversation.isUpdated)) {
      dispatch(slice.actions.pushNewConversation({ chat: mess }));
      dispatch(slice.actions.toggleUpdated({ value: true }));
    }
  };
}
export function toggleUpdated(value) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.toggleUpdated({ value: value }));
  };
}