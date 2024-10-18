import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/users/userSlice";
import authReducer from "../features/auth/authSlice";
import workoutReducer from "../features/workouts/workoutSlice";
import teamsReducer from "../features/teams/teamSlice";

export default configureStore({
	reducer: {
		user: userReducer,
		workout: workoutReducer,
		team: teamsReducer,
		auth: authReducer,
	},
});
