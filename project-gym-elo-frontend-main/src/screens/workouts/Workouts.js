import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
} from "react-native";
import {
  updateTodayWorkout,
  getUser,
  updateWorkoutSchedule,
  updateSchedule,
} from "../../features/users/userSlice";
import {
  selectWorkout,
  removeWorkout,
} from "../../features/workouts/workoutSlice";
import { useSelector, useDispatch } from "react-redux";
import { AntDesign } from "@expo/vector-icons";
import { updateUser } from "../../actions/server";
import { createUser } from "../../features/users/userSlice";

export default function FindWorkoutsScreen({ navigation }) {
  const dispatch = useDispatch();
  const workout = useSelector(selectWorkout);
  const user = useSelector(getUser);
  const [schedule, setSchedule] = useState(user.schedule);
  const workoutSchedule = schedule
    ? schedule.workoutSchedule
      ? schedule.workoutSchedule.length > 0
        ? [...user.schedule.workoutSchedule]
        : []
      : []
    : [];
  const previousWorkoutIndex = user.schedule
    ? user.schedule.previousWorkoutIndex
    : -1;
  const todayWorkoutIndex = workoutSchedule
    ? workoutSchedule.length > 0
      ? (previousWorkoutIndex + 1) % workoutSchedule.length
      : -1
    : -1;
  const [workoutData, setWorkoutData] = useState(workout);
  const [sorted, setSorted] = useState(true);
  useEffect(() => {
    setWorkoutData(workout);
    setSchedule(user.schedule);
  }, [dispatch, user, workout]);
  const handleSort = () => {
    if (sorted) {
      setWorkoutData([...workout].sort((a, b) => b.name.localeCompare(a.name)));
    } else {
      setWorkoutData([...workout].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setSorted(!sorted);
  };

  const doToday = async (workout) => {
    if (!schedule) {
      Alert.alert("Would you like to...", "", [
        {
          text: "Only replace today's workout",
          onPress: () => {
            const today = new Date();
            const formattedDate =
              String(today.getMonth() + 1) +
              "/" +
              String(today.getDate()) +
              "/" +
              String(today.getFullYear());
            let mockUser = { ...user };
            mockUser.schedule = {
              scheduleVersion: 0,
              restDayGap: Number(-1),
              restDays: [],
              workoutSchedule: [],
              previousWorkoutIndex: Number(-1),
              todayWorkoutID: String(workout._id),
              daysSinceRest: 0,
              lastCompletedDay: formattedDate,
            };
            dispatch(createUser(mockUser));
            updateUser(user._id, mockUser).finally(() =>
              navigation.navigate("WorkoutsScreen", { params: "schedule" })
            );
          },
        },
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
      ]);
    } else {
      if (schedule.todayWorkoutID == "rest") {
        Alert.alert(
          `Reminder: today is a rest day. Do you want to do ${workout.name}?`,
          "",
          [
            {
              text: "Yes",
              onPress: () => {
                let mockUser = { ...user };
                let mockSchedule = { ...user.schedule };
                mockSchedule.todayWorkoutID = String(workout._id);
                mockUser.schedule = mockSchedule;
                dispatch(updateTodayWorkout(workout._id));
                updateUser(user._id, mockUser).finally(() =>
                  navigation.navigate("WorkoutsScreen", {
                    params: "schedule",
                  })
                );
              },
            },
            {
              text: "Cancel",
              onPress: () => {},
              style: "cancel",
            },
          ]
        );
      } else if (schedule.workoutSchedule.length > 0) {
        Alert.alert("Would you like to...", "", [
          {
            text: "Only replace today's workout",
            onPress: () => {
              let mockUser = { ...user };
              let mockSchedule = { ...user.schedule };
              mockSchedule.todayWorkoutID = String(workout._id);
              mockUser.schedule = mockSchedule;
              dispatch(updateTodayWorkout(workout._id));
              updateUser(user._id, mockUser).finally(() =>
                navigation.navigate("WorkoutsScreen", { params: "schedule" })
              );
            },
          },
          {
            text: "Permanently replace in schedule",
            onPress: () => {
              workoutSchedule[todayWorkoutIndex] = String(workout._id);
              dispatch(updateWorkoutSchedule(workoutSchedule));
              let mockUser = { ...user };
              let mockSchedule = { ...user.schedule };
              mockSchedule.todayWorkoutID = String(workout._id);
              mockSchedule.workoutSchedule = workoutSchedule;
              mockUser.schedule = mockSchedule;
              dispatch(updateTodayWorkout(workout._id));
              updateUser(user._id, mockUser).finally(() =>
                navigation.navigate("WorkoutsScreen", { params: "schedule" })
              );
            },
          },
          {
            text: "Cancel",
            onPress: () => {},
            style: "cancel",
          },
        ]);
      } else {
        Alert.alert("Would you like to...", "", [
          {
            text: "Only replace today's workout",
            onPress: () => {
              let mockUser = { ...user };
              let mockSchedule = { ...user.schedule };
              mockSchedule.todayWorkoutID = String(workout._id);
              mockUser.schedule = mockSchedule;
              dispatch(updateTodayWorkout(workout._id));
              updateUser(user._id, mockUser).finally(() =>
                navigation.navigate("WorkoutsScreen", { params: "schedule" })
              );
            },
          },
          {
            text: "Cancel",
            onPress: () => {},
            style: "cancel",
          },
        ]);
      }
    }
  };
  const handleDelete = async (id) => {
    dispatch(removeWorkout(id));
    let mockUser = { ...user };
    let updatedWorkoutsSchedule = [...user.schedule.workoutSchedule];
    let updatedWorkouts = [...user.workouts];
    if (user.workouts) {
      updatedWorkouts = updatedWorkouts.filter((item) => item != id);
    }
    if (user.schedule.workoutSchedule) {
      updatedWorkoutsSchedule = updatedWorkoutsSchedule.filter(
        (item) => item != id
      );
    }

    mockUser.workouts = updatedWorkouts;
    mockUser.schedule.workoutSchedule = updatedWorkoutsSchedule;
    dispatch(updateWorkoutSchedule(updatedWorkoutsSchedule));
    dispatch(createUser(mockUser));
    await updateUser(user._id, mockUser);
  };

  const Workout = ({ workout }) => {
    let reps = 0;
    let sets = 0;
    if (workout.plan) {
      for (var i = 0, l = workout.plan.length; i < l; i++) {
        sets += workout.plan[i].lifts.length;
        for (var j = 0, k = workout.plan[i].lifts.length; j < k; j++) {
          reps += Number(workout.plan[i].lifts[j].reps);
        }
      }
      if (workout._id != "rest") {
        return (
          <SafeAreaView style={styles.workoutView}>
            <Pressable
              style={({ pressed }) => [
                styles.workoutContainer || {},
                { opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={() =>
                Alert.alert("Would you like to...", "", [
                  {
                    text: "Do Workout",
                    onPress: () => {
                      navigation.navigate("DoWorkouts", {
                        workoutPlanParams: workout,
                      });
                    },
                  },
                  {
                    text: "View Workout",
                    onPress: () => {
                      navigation.navigate("AddWorkouts", {
                        workoutPlanParams: [workout, false],
                      });
                    },
                  },
                ])
              }
            >
              <SafeAreaView style={styles.containerTitle}>
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteButton || {},
                    { opacity: pressed ? 0.5 : 1 },
                  ]}
                  onPress={() =>
                    Alert.alert(
                      `Are you sure you want to delete ${workout.name}? (This cannot be undone)`,
                      "",
                      [
                        {
                          text: "Yes",
                          onPress: () => {
                            handleDelete(workout._id);
                          },
                        },
                        {
                          text: "Cancel",
                          onPress: () => {},
                          style: "cancel",
                        },
                      ]
                    )
                  }
                >
                  <Text style={styles.deleteButtonText}>-</Text>
                </Pressable>
                <Text style={styles.workoutHeader}>{workout.name}</Text>
                <Text style={styles.workoutTime}>
                  Est. Time: {workout.time} min(s)
                </Text>
              </SafeAreaView>

              <SafeAreaView style={styles.containerText}>
                <Text style={styles.workoutBodyHeader}>
                  {workout.plan.length} Exercises
                </Text>
                <Text style={styles.workoutBodyHeader}>{reps} Reps</Text>
                <Text style={styles.workoutBodyHeader}>{sets} Sets</Text>
              </SafeAreaView>
              <Pressable
                style={({ pressed }) => [
                  styles.todayButton || {},
                  { opacity: pressed ? 0.5 : 1 },
                ]}
                onPress={() => doToday(workout)}
              >
                <Text style={styles.todayButtonText}>Do Today</Text>
              </Pressable>
            </Pressable>
          </SafeAreaView>
        );
      }
    }
  };

  if (user && workout.length < 2) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Pressable
          style={({ pressed }) => [
            styles.newUser || {},
            { opacity: pressed ? 0.5 : 1 },
          ]}
          onPress={() => {
            const today = new Date();
            const formattedDate =
              String(today.getMonth() + 1) +
              "/" +
              String(today.getDate()) +
              "/" +
              String(today.getFullYear());
            let mockUser = { ...user };
            mockUser.schedule = {
              scheduleVersion: 0,
              restDayGap: Number(-1),
              restDays: [],
              workoutSchedule: [],
              previousWorkoutIndex: Number(-1),
              todayWorkoutID: "",
              daysSinceRest: 0,
              lastCompletedDay: formattedDate,
            };
            dispatch(createUser(mockUser));
            updateUser(user._id, mockUser);
            navigation.navigate("AddWorkouts", {
              workoutPlanParams: [
                {
                  name: "New Workout",
                  plan: [],
                  timeCreated: parseInt(Date.now() / 1000),
                },
                true,
              ],
            });
          }}
        >
          <View style={styles.newUserButton}>
            <Text style={styles.newUserButtonText}>create workout</Text>
          </View>
        </Pressable>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <SafeAreaView style={styles.view}>
          <Text style={styles.header}>All Workouts</Text>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
            onPress={() => handleSort()}
          >
            <View style={styles.titleButton}>
              <Text style={styles.titleButtonText}>sort</Text>
              {sorted ? (
                <>
                  <AntDesign name="arrowup" size={15} color="#00693E" />
                  <AntDesign name="arrowdown" size={15} color="#00693E" />
                </>
              ) : (
                <>
                  <AntDesign name="arrowdown" size={15} color="#00693E" />
                  <AntDesign name="arrowup" size={15} color="#00693E" />
                </>
              )}
            </View>
          </Pressable>
        </SafeAreaView>
        <SafeAreaView style={{ flex: 1 }}>
          <FlatList
            data={workoutData}
            renderItem={({ item }) => <Workout workout={item} />}
            contentContainerStyle={{ paddingBottom: 125 }}
          />
        </SafeAreaView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    flexDirection: "row",
    margin: 15,
    paddingTop: 20,
    justifyContent: "space-between",
  },

  containerFlex: {
    flexDirection: "column",
    margin: 15,
  },
  header: {
    flex: 1,
    textAlign: "left",
    fontSize: 23,
    paddingVertical: 10,
    fontWeight: "800",
    color: "#000000",
  },
  containerText: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  titleButton: {
    flexDirection: "row",
    marginTop: 10,
    paddingTop: 7,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#00693E",
    backgroundColor: "transparent",
  },
  titleButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00693E",
    paddingRight: 3,
  },
  newUser: {
    verticalAlign: "middle",
    width: "50%",
    alignSelf: "center",
  },
  newUserButton: {
    alignItems: "center",
    marginTop: 10,
    padding: 7,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#00693E",
    backgroundColor: "transparent",
  },
  newUserButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#00693E",
    paddingRight: 3,
  },
  todayButton: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
    height: 30,
    width: "30%",
    borderRadius: 20,
    backgroundColor: "#00693E",
    ShadowColor: "#000000",
    shadowOpacity: 0.2,
    ShadowOffset: { x: 0, y: 1 },
    ShadowRadius: 3,
    justifyContent: "center",
    alignSelf: "center",
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
    paddingRight: 3,
    alignSelf: "center",
  },
  workoutView: {
    flexDirection: "column",
    marginBottom: 10,
    marginHorizontal: 15,
  },
  workoutContainer: {
    paddingY: 2,
    marginTop: 3,
    marginBottom: 7,
    flexDirection: "column",
    backgroundColor: "#ACCAAF",
    borderRadius: 20,
    ShadowColor: "#000000",
    shadowOpacity: 0.2,
    ShadowOffset: { x: 3, y: 6 },
    ShadowRadius: 3,
  },
  containerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  workoutHeader: {
    margin: 10,
    marginLeft: 10,
    fontSize: 25,
    width: "55%",
    overflow: "hidden",
    fontWeight: "800",
    alignSelf: "center",
    color: "#000000",
  },
  workoutTime: {
    margin: 10,
    marginRight: 20,
    fontSize: 12,
    fontWeight: "800",
    alignSelf: "center",
    color: "#000000",
    maxWidth: "25%",
  },
  workoutBodyHeader: {
    padding: 5,
    fontSize: 15,
    fontWeight: "700",
    alignSelf: "flex-start",
    color: "#000000",
  },
  restHeader: {
    marginVertical: 10,
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "900",
    alignSelf: "flex-start",
    color: "#8A2BE2",
  },
  arrowContainer: {
    verticalAlign: "middle",
  },
  headerCollapse: { minHeight: 50 },
  deleteButton: {
    marginLeft: 5,
    marginTop: 5,
    height: 25,
    width: 25,
    borderWidth: 2,
    borderRadius: 20,
    borderColor: "red",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "red",
    textAlign: "center",
  },
});
