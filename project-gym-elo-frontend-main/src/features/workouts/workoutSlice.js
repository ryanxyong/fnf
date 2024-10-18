import { createSlice } from "@reduxjs/toolkit";

export const workoutSlice = createSlice({
  name: "workout",
  initialState: {
    workouts: [
      {
        _id: "rest",
        name: "Rest Day",
        time: "-------",
        plan: [],
      },
    ],
  },
  reducers: {
    newWorkout: (state, action) => {
      var workoutArray = [
        {
          _id: "rest",
          name: "Rest Day",
          time: "-------",
          plan: [],
        },
      ];
      state.workouts = workoutArray.concat(action.payload);
    },
    addWorkout: (state, action) => {
      var found = state.workouts.filter(
        (workout) => workout._id == action.payload._id
      );
      if (found.length == 0) {
        state.workouts.push(action.payload);
      }
    },
    removeWorkout: (state, action) => {
      const workoutIdToRemove = action.payload;
      state.workouts = state.workouts.filter(
        (workout) => workout._id !== workoutIdToRemove
      );
    },
    updateWorkout: (state, action) => {
      const index = state.workouts.findIndex(
        (obj) => obj._id == action.payload.id
      );
      if (index === -1) {
        state.workouts.push(action.payload.workout);
      } else {
        state.workouts[index] = action.payload.workout;
      }
    },
  },
});

export const { newWorkout, addWorkout, removeWorkout, updateWorkout } =
  workoutSlice.actions;

export const selectWorkout = (state) => state.workout.workouts;
export const todayWorkoutID = (id) => (state) => {
  if (id?.todayWorkoutID) {
    return state.workout.workouts.find((obj) => obj._id == id.todayWorkoutID);
  } else {
    return null;
  }
};
export const specificWorkout = (id) => (state) =>
  state.workout.workouts.find((obj) => obj._id == id);
export default workoutSlice.reducer;
