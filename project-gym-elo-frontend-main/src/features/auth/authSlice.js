// Adapted: https://github.com/Bria222/React-Redux-Toolkit-Login-Register/tree/development

import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userSignUp, userSignIn } from "./authActions";

// initialize userToken from local storage

const initialState = {
  loading: false,
  userInfo: null,
  userToken: null,
  error: null,
  success: false,
};

const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
        console.log("Logging out")
        // unsub from pusher
        AsyncStorage.getItem('id').then((value) => {
          console.log(value)
          unsubscribeFromPusher(value)
        });
        AsyncStorage.removeItem('userToken') // delete token from storage
        AsyncStorage.removeItem('id') // delete id from storage
        AsyncStorage.removeItem('email') // delete token from storage
        AsyncStorage.removeItem('password') // delete token from storage
        AsyncStorage.removeItem('exp') // delete token from storage
        state.loading = false
        state.userInfo = null
        state.userToken = null
        state.error = null
    },
    setCredentials: (state, { payload }) => {
      state.userInfo = payload;
    },
  },
  extraReducers: {
    // login user
    [userSignIn.pending]: (state) => {
      state.loading = true;
      state.error = null;
    },
    [userSignIn.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.userInfo = payload.user;
      state.userToken = payload.token;
    },
    [userSignIn.rejected]: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
    // register user
    [userSignUp.pending]: (state) => {
      state.loading = true;
      state.error = null;
    },
    [userSignUp.fulfilled]: (state, { payload }) => {
      state.loading = false;
      state.success = true; // registration successful
    },
    [userSignUp.rejected]: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
  },
});

export const { logout, setCredentials } = authSlice.actions;

export default authSlice.reducer;
