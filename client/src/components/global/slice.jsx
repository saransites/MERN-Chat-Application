import axios from "axios";
import { createSlice } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// Load initial state from local storage
const loadStateFromLocalStorage = (key) => {
  try {
    const serializedState = localStorage.getItem(key);
    return serializedState ? JSON.parse(serializedState) : null;
  } catch (err) {
    console.error("Error loading state from local storage", err);
    return null;
  }
};

// Save state to local storage
const saveStateToLocalStorage = (key, state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (err) {
    console.error("Error saving state to local storage", err);
  }
};

const initialState = {
  user: loadStateFromLocalStorage("user"),
  token: localStorage.getItem("token") || null,
  currentUser: loadStateFromLocalStorage("currentUser"),
  onlineUser: [],
};

const Slices = createSlice({
  name: "data",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.user = action.payload;
      saveStateToLocalStorage("user", action.payload);
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      saveStateToLocalStorage("currentUser", action.payload);
    },
    setOnlineUsers: (state, action) => {
      const user = action.payload;
      if (!state.onlineUser.some((u) => u._id === user._id)) {
        state.onlineUser.push(user);
      }
    },
    removeOnlineUser: (state, action) => {
      const userId = action.payload;
      state.onlineUser = state?.onlineUser?.filter((user) => user._id !== userId);
    },
    logout: (state) => {
      state.user = null;
      state.currentUser = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
    },
  },
});

export const {
  setToken,
  setUsers,
  setCurrentUser,
  setOnlineUsers,
  logout,
  removeOnlineUser,
  setUnreadMessages,
  updateUnreadMessages,
} = Slices.actions;
const UseApi = () => {
  const token = initialState.token;

  return axios.create({
    baseURL: 'https://mern-chat-application-a8lw.onrender.com',
    timeout: 25000,
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
};
export default Slices.reducer;
export { UseApi };
