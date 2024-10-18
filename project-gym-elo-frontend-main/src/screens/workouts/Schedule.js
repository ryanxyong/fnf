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
import { useDispatch, useSelector } from "react-redux";
import {
  selectWorkout,
  specificWorkout,
} from "../../features/workouts/workoutSlice";
import {
  createUser,
  getUser,
  updateSchedule,
} from "../../features/users/userSlice";
import { updateUser } from "../../actions/server";

export default function YourWorkoutsScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const workouts = useSelector(selectWorkout);
  const [schedule, setSchedule] = useState(user.schedule);
  const [lastWorkoutComp, setLastWorkoutComp] = useState(null);
  const previousWorkoutIndex = user.schedule
    ? user.schedule.previousWorkoutIndex
    : -1;

  useEffect(() => {
    setSchedule(user.schedule);
    if (user.schedule) {
      if (user.schedule.lastCompletedDay) {
        let lastWorkoutDate = user.schedule.lastCompletedDay;
        lastWorkoutDate = lastWorkoutDate.split("/");
        lastWorkoutDate = new Date(
          lastWorkoutDate[2],
          lastWorkoutDate[0] - 1,
          lastWorkoutDate[1]
        );
        setLastWorkoutComp(lastWorkoutDate);
      }
    }
  }, [dispatch, user, workouts]);
  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const yesterday = new Date();
  const newDay = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedYesterday =
    String(yesterday.getMonth() + 1) +
    "/" +
    String(yesterday.getDate()) +
    "/" +
    String(yesterday.getFullYear());
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let yesterdayComp = formattedYesterday;
  yesterdayComp = yesterdayComp.split("/");
  yesterdayComp = new Date(
    yesterdayComp[2],
    yesterdayComp[0] - 1,
    yesterdayComp[1]
  );

  const missedWorkouts = (change) => {
    let lastWorkoutComp = schedule.lastCompletedDay;
    let yesterdayComp = formattedYesterday;
    lastWorkoutComp = lastWorkoutComp.split("/");
    yesterdayComp = yesterdayComp.split("/");
    lastWorkoutComp = new Date(
      lastWorkoutComp[2],
      lastWorkoutComp[0] - 1,
      lastWorkoutComp[1]
    );
    yesterdayComp = new Date(
      yesterdayComp[2],
      yesterdayComp[0] - 1,
      yesterdayComp[1]
    );
    if (!change) {
      const missedDays = Math.round(
        Math.abs((lastWorkoutComp - yesterdayComp) / oneDay)
      );
      const newPreviousWorkoutIndex =
        (previousWorkoutIndex + missedDays) %
        user.schedule.workoutSchedule.length;
      const newTodayWorkoutID =
        user.schedule.workoutSchedule[
          (newPreviousWorkoutIndex + 1) % user.schedule.workoutSchedule.length
        ];
      schedule.previousWorkoutIndex = newPreviousWorkoutIndex;
      schedule.todayWorkoutID = String(newTodayWorkoutID);
      schedule.lastCompletedDay = formattedYesterday;
      const scheduleUpdate = async () => {
        let mockUser = { ...user };
        dispatch(updateSchedule(schedule));
        mockUser.schedule = schedule;
        await updateUser(user._id, mockUser);
      };
      scheduleUpdate();
    } else {
      schedule.lastCompletedDay = formattedYesterday;
      const scheduleUpdate = async () => {
        let mockUser = { ...user };
        mockUser.schedule = schedule;
        dispatch(updateSchedule(schedule));
        await updateUser(user._id, mockUser);
      };
      scheduleUpdate();
    }
  };

  const Rest = () => {
    return (
      <SafeAreaView style={styles.daysContainer}>
        <SafeAreaView style={styles.daysTextContainer}>
          <Text style={styles.restHeader}>Rest Day</Text>
        </SafeAreaView>
      </SafeAreaView>
    );
  };

  const Scheduler = (item) => {
    newDay.setDate(newDay.getDate() + 1);
    if (schedule.workoutSchedule.length > 0) {
      let workoutPlan = null;
      if (schedule.scheduleVersion == 0) {
        if (Number(schedule.restDayGap) < 1) {
          workoutPlan =
            schedule.workoutSchedule[
              item.index % schedule.workoutSchedule.length
            ];
        } else {
          if ((item.index + 1) % (Number(schedule.restDayGap) + 1) == 0) {
            workoutPlan = "rest";
          } else {
            workoutPlan =
              schedule.workoutSchedule[
                (item.index -
                  Math.trunc(item.index / (Number(schedule.restDayGap) + 1))) %
                  schedule.workoutSchedule.length
              ];
          }
        }
      } else {
        let workoutDays = 0;
        if (schedule.restDays.includes(weekday[newDay.getDay()])) {
          workoutPlan = "rest";
        } else {
          for (let day = 0; day <= item.index; day++) {
            let dayOfWeekIndex = (today.getDay() + day) % 7;
            if (!schedule.restDays.includes(weekday[dayOfWeekIndex])) {
              workoutDays += 1;
            }
          }
          workoutPlan =
            schedule.workoutSchedule[
              (workoutDays - 1) % schedule.workoutSchedule.length
            ];
        }
      }
      let workout = "rest";
      let reps = 0;
      let sets = 0;
      if (workoutPlan && workoutPlan != "rest") {
        workout = useSelector(specificWorkout(workoutPlan));
        if (workout) {
          for (var i = 0, l = workout.plan.length; i < l; i++) {
            sets += workout.plan[i].lifts.length;
            for (var j = 0, k = workout.plan[i].lifts.length; j < k; j++) {
              reps += Number(workout.plan[i].lifts[j].reps);
            }
          }
        }
      }
      if (workout) {
        return (
          <SafeAreaView style={styles.daysView}>
            <Text style={styles.daysHeader}>
              {weekday[newDay.getDay()]}, {newDay.toLocaleDateString()}
            </Text>
            {workoutPlan == "rest" && <Rest />}
            {workoutPlan != "rest" && (
              <Pressable
                style={({ pressed }) => [
                  styles.daysContainer || {},
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
                  <Text style={styles.daysBodyHeader}>{workout.name}</Text>
                  <Text style={styles.workoutTime}>
                  Est. Time: {workout.time} min(s)
                </Text>
                </SafeAreaView>

                <SafeAreaView style={styles.daysTextContainer}>
                  <Text style={styles.daysBodyText}>
                    {workout.plan.length} Exercises
                  </Text>
                  <Text style={styles.daysBodyText}>{reps} Reps</Text>
                  <Text style={styles.daysBodyText}>{sets} Sets</Text>
                </SafeAreaView>
              </Pressable>
            )}
          </SafeAreaView>
        );
      }
    }
  };

  const Today = () => {
    const workoutPlan = useSelector(specificWorkout(schedule.todayWorkoutID));
    let reps = 0;
    let sets = 0;
    if (workoutPlan) {
      for (var i = 0, l = workoutPlan.plan.length; i < l; i++) {
        sets += workoutPlan.plan[i].lifts.length;
        for (var j = 0, k = workoutPlan.plan[i].lifts.length; j < k; j++) {
          reps += Number(workoutPlan.plan[i].lifts[j].reps);
        }
      }

      return (
        <SafeAreaView style={styles.daysView}>
          {workoutPlan._id === "rest" && <Rest />}
          {workoutPlan._id != "rest" && (
            <Pressable
              style={({ pressed }) => [
                styles.daysContainer || {},
                { opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={() =>
                Alert.alert("Would you like to...", "", [
                  {
                    text: "Do Workout",
                    onPress: () => {
                      navigation.navigate("DoWorkouts", {
                        workoutPlanParams: workoutPlan,
                      });
                    },
                  },
                  {
                    text: "View Workout",
                    onPress: () => {
                      navigation.navigate("AddWorkouts", {
                        workoutPlanParams: [workoutPlan, false],
                      });
                    },
                  },
                ])
              }
            >
              <SafeAreaView style={styles.containerTitle}>
                <Text style={styles.daysBodyHeader}>{workoutPlan.name}</Text>
                <Text style={styles.workoutTime}>
                  Est. Time: {workoutPlan.time} min(s)
                </Text>
              </SafeAreaView>

              <SafeAreaView style={styles.daysTextContainer}>
                <Text style={styles.daysBodyText}>
                  {workoutPlan.plan.length} Exercises
                </Text>
                <Text style={styles.daysBodyText}>{reps} Reps</Text>
                <Text style={styles.daysBodyText}>{sets} Sets</Text>
              </SafeAreaView>
            </Pressable>
          )}
        </SafeAreaView>
      );
    } else {
      return <Text style={styles.noToday}>No Workout Added</Text>;
    }
  };

  if (workouts.length < 2) {
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
  } else if (!schedule) {
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
            navigation.navigate("ScheduleWorkouts");
          }}
        >
          <View style={styles.newUserButton}>
            <Text style={styles.newUserButtonText}>create schedule</Text>
          </View>
        </Pressable>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {lastWorkoutComp &&
          lastWorkoutComp < yesterdayComp &&
          schedule.workoutSchedule.length > 0 &&
          Alert.alert("Oh no! You missed a previous workout!", "", [
            {
              text: "Start at first missed workout",
              onPress: () => missedWorkouts(true),
            },
            {
              text: "Start at today's workout",
              onPress: () => missedWorkouts(false),
            },
          ])}
        <FlatList
          ListHeaderComponent={
            <>
              <SafeAreaView style={styles.view}>
                <Text style={styles.header}>Today</Text>
              </SafeAreaView>
              <SafeAreaView>
                <Today />
              </SafeAreaView>
              <SafeAreaView style={styles.view}>
                <Text style={styles.header}>Upcoming Week</Text>
                <Pressable
                  style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                  onPress={() => navigation.navigate("ScheduleWorkouts")}
                >
                  <View style={styles.titleButton}>
                    <Text style={styles.titleButtonText}>edit schedule</Text>
                  </View>
                </Pressable>
              </SafeAreaView>
              {schedule.workoutSchedule.length == 0 && (
                <Text style={styles.noSchedule}>No Schedule</Text>
              )}
            </>
          }
          data={[1, 2, 3, 4, 5, 6]}
          renderItem={({ item }) => <Scheduler index={item} />}
          contentContainerStyle={{ paddingBottom: 125 }}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    flexDirection: "row",
    margin: 15,
    justifyContent: "space-between",
  },
  header: {
    flex: 1,
    textAlign: "left",
    fontSize: 23,
    paddingVertical: 0,
    fontWeight: "800",
    color: "#000000",
  },
  daysText: {
    flex: 1,
    textAlign: "left",
    fontSize: 20,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 10,
  },
  titleButton: {
    flexDirection: "row",
    paddingTop: 7,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "white",
    ShadowColor: "#000000",
    shadowOpacity: 0.1,
    ShadowOffset: { x: 0, y: -1 },
    ShadowRadius: 1,
  },
  titleButtonText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
    color: "#00693E",
    paddingRight: 3,
  },
  daysView: {
    flexDirection: "column",
    marginBottom: 10,
    marginHorizontal: 15,
  },
  daysContainer: {
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
  daysTextContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  daysHeader: {
    fontSize: 19,
    marginBottom: 3,
    fontWeight: "900",
    alignSelf: "flex-start",
    color: "#000000",
  },
  workoutTime: {
    margin: 10,
    marginRight: 20,
    fontSize: 12,
    fontWeight: "800",
    alignSelf: "center",
    color: "#000000",
  },
  daysBodyHeader: {
    margin: 10,
    marginLeft: 20,
    fontSize: 25,
    fontWeight: "800",
    alignSelf: "center",
    color: "#000000",
    maxWidth: "65%",
  },
  daysBodyText: {
    padding: 14,
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },
  restHeader: {
    marginVertical: 10,
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "900",
    alignSelf: "flex-start",
    color: "#00693E",
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
  noSchedule: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  noToday: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
});
