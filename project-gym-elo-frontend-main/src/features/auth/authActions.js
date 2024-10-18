// Adapted: https://github.com/Bria222/React-Redux-Toolkit-Login-Register/tree/development

import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage';

//const ROOT_URL = "http://172.20.10.2:5555/api";
const ROOT_URL = "https://fnf-prod.up.railway.app/api";

export const userSignIn = createAsyncThunk(
  '/users/signin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${ROOT_URL}/users/signin`, { email, password })
        // console.log("user sign in:", response.data)
        // store user's token in local storage
        await AsyncStorage.setItem('userToken', response.data.token)
        await AsyncStorage.setItem('id', response.data.user._id)
        // store email and password to allow for persistent signin
        await AsyncStorage.setItem('email', email)
        await AsyncStorage.setItem('password', password)
        // Set expiry to 1 hour since last signin, H * 60 * 60 means H hours after signin
        const expiry = (Math.round(Date.now() / 1000 + 1 * 60 * 60)).toString();
        await AsyncStorage.setItem('exp', expiry)
        // AsyncStorage.getItem('userToken').then((value) => {
        //   console.log("this should be same as user sign in token:", value)
        // })
        return response.data
    } catch (error) {
      // return custom error message from API if any
        if (error.response && error.response.data.error_message) {
            return rejectWithValue(error.response.data.error_message)
        } else {
            return rejectWithValue(error.message)
        }
        }
    }
)

export const userSignUp = createAsyncThunk(
  '/users/signup',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }

      await axios.post(`${ROOT_URL}/users/signup`, { email, password }, config)
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message)
      } else {
        return rejectWithValue(error.message)
      }
    }
  }
)