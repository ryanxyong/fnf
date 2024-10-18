import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: {},
  },
  reducers: {
    createUser: (state, action) => {
      state.user = action.payload;
    },
    updateTodayWorkout: (state, action) => {
      state.user.schedule.todayWorkoutID = action.payload;
      console.log(state.user);
    },
    updateSchedule: (state, action) => {
      state.user.schedule = action.payload;
    },
    updateWorkoutSchedule: (state, action) => {
      state.user.schedule.workoutSchedule = action.payload;
    },
    updateEvents: (state, action) => {
      state.user.events = action.payload;
    },
    addEvent: (state, action) => {
      if (!state.user.events.includes(action.payload)) {
        state.user.events.push(action.payload);
      }
    },
    addGroup: (state, action) => {
      if (!state.user.groups.includes(action.payload)) {
        state.user.groups.push(action.payload);
      }
    },
    removeGroup: (state, action) => {
      const groupIdToRemove = action.payload;
      state.user.groups = state.user.groups.filter(
        (group) => group !== groupIdToRemove
      );
    },
    addAllEvents: (state, action) => {
      for (i in action.payload) {
        if (!state.user.events.includes(action.payload[i])) {
          state.user.events.push(action.payload[i]);
        }
      }
    },
    removeEvent: (state, action) => {
      const eventtIdToRemove = action.payload;
      state.user.events = state.user.events.filter(
        (event) => event !== eventtIdToRemove
      );
    },
    removeAllEvents: (state, action) => {
      for (i in action.payload) {
        if (state.user.events.includes(action.payload[i])) {
          state.user.events.filter((event) => event !== action.payload[i]);
        }
      }
    },
    addChat: (state, action) => {
      if (!state.user.chats.includes(action.payload)) {
        state.user.chats.push(action.payload);
      }
    },
    removeChat: (state, action) => {
      const chatIdToRemove = action.payload;
      state.user.chats = state.user.chats.filter(
        (group) => group !== chatIdToRemove
      );
    },
    deleteUser: (state) => {
      state = {};
    },
  },
});

export const {
  createUser,
  deleteUser,
  updateTodayWorkout,
  updateSchedule,
  updateWorkoutSchedule,
  addEvent,
  addAllEvents,
  removeEvent,
  removeAllEvents,
  updateEvents,
  addGroup,
  removeGroup,
  addChat,
  removeChat,
} = userSlice.actions;
export const getUser = (state) => state.user.user;
export const getEvents = (state) => state.user.user.events;
export const getTeamWorkouts = (state) => state.user.user.teamWorkouts;
export const getGroups = (state) => state.user.user.groups;
export default userSlice.reducer;
