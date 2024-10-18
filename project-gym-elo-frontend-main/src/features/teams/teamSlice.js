import { createSlice } from "@reduxjs/toolkit";

export const teamSlice = createSlice({
	name: "team",
	initialState: {
		teams: [],
	},
	reducers: {
		newTeam: (state, action) => {
			state.teams.push(action.payload);
		},
		addMember: (state, action) => {
			const index = state.teams.findIndex((obj) => obj.id == action.payload.id);
			state.teams[index].membersID.push(action.payload.memberID);
		},
		addChat: (state, action) => {
			const { id, chat } = action.payload;
			const teamIndex = state.teams.findIndex((team) => team.id === id);

			state.teams[teamIndex].chatLog = [
				...state.teams[teamIndex].chatLog,
				...chat,
			];
		},
		addEvent: (state, action) => {
			const index = state.teams.findIndex((obj) => obj.id == action.payload.id);
			state.teams[index].events.push(action.payload.event);
		},
		addLeaderboard: (state, action) => {
			const index = state.teams.findIndex((obj) => obj.id == action.payload.id);
			state.teams[index].leaderboards.push(action.payload.leaderboard);
		},
	},
});

export const { newTeam, addMember, addChat, addEvent, addLeaderboard } =
	teamSlice.actions;

export const getTeam = (id) => (state) =>
	state.team.teams.find((obj) => obj.id == id);
export const getAllTeams = (state) => state.team.teams;
export const getUserTeams = (id) => (state) =>
	state.team.teams.filter((obj) => obj.membersID.indexOf(id) !== -1);
export const getEvents = (id) => (state) =>
	state.team.teams.find((obj) => obj.id == id).events;
export const getChatLog = (id) => (state) =>
	state.team.teams.find((obj) => obj.id == id).chatLog;
export const getLeaderboards = (id) => (state) =>
	state.team.teams.find((obj) => obj.id == id).leaderboards;
export default teamSlice.reducer;