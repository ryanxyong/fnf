import { useDispatch } from "react-redux";
import {
  createUser,
  addEvent,
  addAllEvents,
  removeEvent,
} from "../features/users/userSlice";
import { addWorkout } from "../features/workouts/workoutSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

//** TODO this will need to be IP address I think, leaving it as localhost rn but will need to be changed for testing */

const ROOT_URL = "https://fnf-prod.up.railway.app/api";
//const ROOT_URL = "http://172.20.10.2:5555/api";
const dispatch = useDispatch;

import axios from "axios";

export async function fetchExercise(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/exercises/${id}`);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

// START: User related functions //

export async function signUpUser(email, password) {
  try {
    const response = await axios.post(`${ROOT_URL}/users/signup`, {
      email,
      password,
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error.response);
    throw error; // Handle error case
  }
}

export async function signInUser(email, password) {
  try {
    const response = await axios.post(`${ROOT_URL}/users/signin`, {
      email,
      password,
    });
    return response.data; // Return the actual data
  } catch (error) {
    // console.error(error.response);
    return error; // Handle error case
  }
}

export async function resetPassword(data) {
  // data should include fields:
  // email, newPassword, maiden, teacher
  // maiden and teacher will be required security fields
  try {
    const response = await axios.put(`${ROOT_URL}/users/reset`, data);
    return response; // Return the actual data
  } catch (error) {
    console.error("reset error", error.response);
    return error; // Handle error case
  }
}

export async function updateUser(id, data) {
  try {
    // console.log("new data", data);
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.put(`${ROOT_URL}/users/update/${id}`, data, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function deleteUser(id) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.delete(`${ROOT_URL}/users/${id}`, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function fetchUser(id, dispatch) {
  try {
    const response = await axios.get(`${ROOT_URL}/users/info/${id}`);
    // console.log(response.data); // Dispatch the createUser action with response.data

    await dispatch(createUser(response.data));
    for (i in response.data.workouts) {
      await fetchWorkouts(response.data.workouts[i], dispatch);
    }
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function getUserByEmail(email) {
  try {
    const response = await axios.get(`${ROOT_URL}/users/info/email/${email}`);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function fetchOtherUser(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/users/info/${id}`);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

// END: User related functions //

// START: Security question related functions //

export async function createSecurity(data) {
  // data should include all three required fields:
  // userEmail, maiden, teacher
  // maiden and teacher will be required security questions
  try {
    const response = await axios.post(`${ROOT_URL}/security/`, data);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

// END: Security question related functions //

// START: Message related functions //

export async function postMessage(data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.post(`${ROOT_URL}/messages/`, data, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function fetchMessage(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/messages/chat/${id}`);
    return response.data.messages; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function fetchChatMessages(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/messages/chat/${id}`); // fix with correct call once we make the back end api
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function fetchChatGroup(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/groups/chatroom/${id}`); // fix with correct call once we make the back end api
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function deleteMessage(id) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.delete(`${ROOT_URL}/messages/${id}`, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

// END: Message related functions //

// START: Event related functions //

export async function postEvent(data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.post(`${ROOT_URL}/events/`, data, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function fetchEvent(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/events/${id}`);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}
export async function addUserEvent(user, event, dispatch) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const eventsArray = [...user.events];
    eventsArray.push(event);
    const userData = { ...user };
    userData.events = [...eventsArray];
    await dispatch(addEvent(event));
    // console.log(userData);
    const response = await axios.put(
      `${ROOT_URL}/users/update/${user._id}`,
      userData,
      { headers: { Authorization: `bearer ${token}` } }
    );
    // console.log(response.data);

    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function addOtherUserEvent(user, event) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const eventsArray = [...user.events];
    eventsArray.push(event);
    const userData = { ...user };
    userData.events = [...eventsArray];
    const response = await axios.put(
      `${ROOT_URL}/users/update/${user._id}`,
      userData,
      { headers: { Authorization: `bearer ${token}` } }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function addAllUserEvent(user, events, dispatch) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const concatArr = user.events.concat(events);
    const result = concatArr.filter(
      (item, idx) => concatArr.indexOf(item) === idx
    );
    const userData = { ...user };
    userData.events = [...result];
    // console.log(userData);
    await dispatch(addAllEvents(result));
    const response = await axios.put(
      `${ROOT_URL}/users/update/${user._id}`,
      userData,
      { headers: { Authorization: `bearer ${token}` } }
    );
    // console.log(response.data);

    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}
export async function removeUserEvent(user, event, dispatch) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    let eventsArray = [...user.events];
    eventsArray = eventsArray.filter((item) => item !== event);
    const userData = { ...user };
    userData.events = [...eventsArray];
    // console.log(userData);
    await dispatch(removeEvent(event));
    const response = await axios.put(
      `${ROOT_URL}/users/update/${user._id}`,
      userData,
      { headers: { Authorization: `bearer ${token}` } }
    );
    // console.log(response.data);

    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}
export async function updateEvent(id, data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.put(`${ROOT_URL}/events/update/${id}`, data, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function deleteEvent(id) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.delete(`${ROOT_URL}/events/${id}`, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function findAllEvents() {
  try {
    const response = await axios.get(`${ROOT_URL}/events/getAllEvents/get/`);
    return response.data; // Return the actual data
  } catch (error) {
    console.error("Error getting all events:", error);
    throw error; // rethrow the error if necessary
  }
}

// END: Event related functions //

// START: Group related functions //

export async function postGroup(data) {
  try {
    // Logic to create a new chat whenever a group is created

    const chat = await postChat({
      name: data.name,
      chatType: 1,
      userIDs: data.members,
    });
    // if (!chat) {
    //   throw error("Could not create chat")
    // }
    // console.log("this should be chat", chat);
    // console.log(chat._id);
    data.chat = chat._id;
    // End
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.post(`${ROOT_URL}/groups/`, data, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log("this should be group", response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function fetchGroup(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/groups/info/${id}`);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error("Error fetching group:", error);
    throw error; // rethrow the error if necessary
  }
}

export async function updateGroup(id, data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.put(`${ROOT_URL}/groups/update/${id}`, data, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function addToGroup(groupId, userID, data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.put(
      `${ROOT_URL}/groups/update/${groupId}/${userID}`,
      data,
      { headers: { Authorization: `bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function deleteGroup(id) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.delete(`${ROOT_URL}/groups/${id}`, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

// END: Group related functions //

export async function findGroups(query) {
  try {
    const response = await axios.get(`${ROOT_URL}/groups/searchAll/${query}`);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error("Error searching for groups:", error);
    throw error; // rethrow the error if necessary
  }
}

export async function findAllGroups() {
  try {
    const response = await axios.get(`${ROOT_URL}/groups/getAllGroups/`);
    return response.data; // Return the actual data
  } catch (error) {
    console.error("Error searching for groups:", error);
    throw error; // rethrow the error if necessary
  }
}

// END: Group related functions //

// START: Group related functions //

export async function postGroupWorkout(data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.post(`${ROOT_URL}/groupWorkouts/`, data, {
      headers: { Authorization: `bearer ${token}` },
    }); // const response = await axios.post(`${ROOT_URL}/groupWorkouts/`, data);
    // console.log("this is reponse:", response);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error.config);
    return error; // Handle error case
  }
}

export async function fetchGroupWorkout(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/groupWorkouts/${id}`);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error("Error fetching group:", error);
    throw error; // rethrow the error if necessary
  }
}

export async function updateGroupWorkout(id, data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.put(`${ROOT_URL}/groupWorkouts/${id}`, data, {
      headers: { authorization: token },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}
export async function deleteGroupWorkout(id) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.delete(`${ROOT_URL}/groupWorkouts/${id}`, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

// END: Group related functions //

// START: Chat room related functions //

export async function postChat(data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.post(`${ROOT_URL}/chatRooms/`, data, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function updateChat(id, data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.put(
      `${ROOT_URL}/chatRooms/update/${id}`,
      data,
      { headers: { Authorization: `bearer ${token}` } }
    );
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function fetchChat(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/chatRooms/${id}`);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function findDM(user1, user2) {
  try {
    const response = await axios.get(
      `${ROOT_URL}/chatRooms/searchDMs/${user1}/${user2}/`
    );
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error("Error searching for DM:", error);
    throw error; // rethrow the error if necessary
  }
}

export async function deleteChat(id) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.delete(`${ROOT_URL}/chatRooms/${id}`, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

// END: Chat room related functions //

// START: Workout related functions //

export async function fetchWorkouts(id, dispatch) {
  try {
    const response = await axios.get(`${ROOT_URL}/workouts/${id}`);
    dispatch(addWorkout(response.data));
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function fetchWorkout(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/workouts/${id}`);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function createWorkout(data, user, workouts, dispatch) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.post(`${ROOT_URL}/workouts`, data, {
      headers: { Authorization: `bearer ${token}` },
    });
    await dispatch(addWorkout(response.data));
    const id = response.data._id;
    let mockUser = { ...user };
    let mockWorkouts = [...workouts];
    mockWorkouts.shift();
    mockWorkouts.push(id);
    mockUser.workouts = mockWorkouts;
    await dispatch(createUser(mockUser));
    updateUser(user._id, mockUser);

    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function updateAllOfWorkout(id, data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.put(`${ROOT_URL}/workouts/${id}`, data, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function deleteWorkout(id) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.delete(`${ROOT_URL}/workouts/${id}`, {
      headers: { Authorization: `bearer ${token}` },
    });
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function addExerciseToWorkout(workoutId, data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.post(
      `${ROOT_URL}/workouts/${workoutId}/exercises`,
      data,
      { headers: { Authorization: `bearer ${token}` } }
    );
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function updateExerciseInWorkout(workoutId, exerciseId, data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.put(
      `${ROOT_URL}/workouts/${workoutId}/exercises/${exerciseId}`,
      data,
      { headers: { Authorization: `bearer ${token}` } }
    );
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function removeExerciseFromWorkout(workoutId, exerciseId) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.delete(
      `${ROOT_URL}/workouts/${workoutId}/exercises/${exerciseId}`,
      { headers: { Authorization: `bearer ${token}` } }
    );
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function fetchExerciseFromWorkout(workoutId, exerciseId) {
  try {
    const response = await axios.get(
      `${ROOT_URL}/workouts/${workoutId}/exercises/${exerciseId}`
    );
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function addLiftToExercise(workoutId, exerciseId, data) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.post(
      `${ROOT_URL}/workouts/${workoutId}/exercises/${exerciseId}/lifts`,
      data,
      { headers: { Authorization: `bearer ${token}` } }
    );
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function updateLiftInExercise(
  workoutId,
  exerciseId,
  liftId,
  data
) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.put(
      `${ROOT_URL}/workouts/${workoutId}/exercises/${exerciseId}/lifts/${liftId}`,
      data,
      { headers: { Authorization: `bearer ${token}` } }
    );
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function removeLiftFromExercise(workoutId, exerciseId, liftId) {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.delete(
      `${ROOT_URL}/workouts/${workoutId}/exercises/${exerciseId}/lifts/${liftId}`,
      { headers: { Authorization: `bearer ${token}` } }
    );
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

export async function fetchLiftFromExercise(workoutId, exerciseId, liftId) {
  try {
    const response = await axios.get(
      `${ROOT_URL}/workouts/${workoutId}/exercises/${exerciseId}/lifts/${liftId}`
    );
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error; // Handle error case
  }
}

// END: Workout related functions //

// START: Date related functions //

export async function fetchDate(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/dates/${id}`);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function getDate(id) {
  try {
    const response = await axios.get(`${ROOT_URL}/dates/search/${id}`);
    // console.log(response.data);
    return response.data; // Return the actual data
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function postDate(data) {
  try {
    const response = await axios.post(`${ROOT_URL}/dates/`, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function queryDate(query) {
  try {
    const response = await axios.get(`${ROOT_URL}/dates/search/${query}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function updateDate(id, data) {
  try {
    const response = await axios.put(`${ROOT_URL}/dates/${id}`, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function deleteDate(id) {
  try {
    const response = await axios.delete(`${ROOT_URL}/dates/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function upsertDate(id, data) {
  try {
    const response = await axios.post(`${ROOT_URL}/dates/upsert/${id}`, data);
    console.log("upsertDate", response.data);
    return response.data;
  } catch (error) {
    console.error(error.config);
    return error;
  }
}
