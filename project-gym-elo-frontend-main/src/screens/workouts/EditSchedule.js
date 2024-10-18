import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import {
  getUser,
  updateSchedule,
  updateEvents,
  getEvents,
  createUser,
} from "../../features/users/userSlice";
import {
  selectWorkout,
  specificWorkout,
} from "../../features/workouts/workoutSlice";
import { fetchEvent, updateUser } from "../../actions/server";
import CalendarPicker from "react-native-calendar-picker";
import Modal from "react-native-modal";

export default function WorkoutScheduleScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const workouts = useSelector(selectWorkout);
  const [schedule, setSchedule] = useState(
    user.schedule ? user.schedule.workoutSchedule : []
  );
  const [scheduleVersion, setScheduleVersion] = useState(
    user.schedule.scheduleVersion
  );
  const previousWorkoutIndex = user.schedule.previousWorkoutIndex;
  const [restDayGap, setRestDayGap] = useState(user.schedule.restDayGap);
  const [restDays, setRestDays] = useState(user.schedule.restDays);
  const today = new Date();
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState(useSelector(getEvents) || []);
  const [selectedDay, setSelectedDay] = useState(today);
  const [isModalVisible, setModalVisible] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [customDatesStyles, setCustomDatesStyles] = useState([]);
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // base functionality gotten from https://www.npmjs.com/package/react-native-calendar-picker
  useEffect(() => {
    let day = new Date();
    day.setMonth(currentMonth);
    day.setDate(1);
    let styles = [];

    while (day.getMonth() === currentMonth) {
      const formattedDate =
        String(day.getMonth() + 1) +
        "/" +
        String(day.getDate()) +
        "/" +
        String(day.getFullYear());
      const eventsList = events.filter(
        (event) => String(event.date) == String(formattedDate)
      );
      if (eventsList.length > 0) {
        styles.push({
          date: new Date(day),

          style: {
            backgroundColor: "#ACCAAF",
          },
        });
      } else {
        styles.push({
          date: new Date(day),

          style: {},
        });
      }

      day.setDate(day.getDate() + 1);
    }
    setCustomDatesStyles(styles);
  }, [events, currentMonth]);

  useEffect(() => {
    if (schedule.length > 0) {
      setSubmit(true);
    } else {
      setSubmit(false);
    }
  }, [schedule]);

  useEffect(() => {
    async function fetchEvents(allEventID) {
      const fetchedEvents = await Promise.all(
        allEventID.map((id) => fetchEvent(id))
      );
      setEvents(fetchedEvents);
    }

    if (user && allEvents.length > 0) {
      fetchEvents(allEvents);
    }
  }, [dispatch, allEvents, user]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const changeDate = (date) => {
    newDate = new Date(date);
    setSelectedDay(newDate);
  };

  const handleSubmit = async () => {
    const newDate = new Date();
    const formattedDate =
      String(newDate.getMonth() + 1) +
      "/" +
      String(newDate.getDate()) +
      "/" +
      String(newDate.getFullYear());
    if (schedule.length > 0) {
      let mockUser = { ...user };
      let newSchedule = { ...user.schedule };
      newSchedule.workoutSchedule = schedule;
      if (restDayGap == "-") {
        newSchedule.restDayGap = -1;
        newSchedule.restDays = restDays;
        newSchedule.scheduleVersion = 1;
      } else {
        newSchedule.restDays = [];
        newSchedule.restDayGap = restDayGap;

        newSchedule.scheduleVersion = 0;
      }
      newSchedule.daysSinceRest = 0;
      newSchedule.previousWorkoutIndex = -1;
      newSchedule.todayWorkoutID = schedule[0];
      newSchedule.lastCompletedDay = formattedDate;
      mockUser.schedule = newSchedule;
      mockUser.events = allEvents;
      dispatch(updateSchedule(newSchedule));
      dispatch(updateEvents(allEvents));
      await updateUser(user._id, mockUser);
      dispatch(createUser(mockUser));
      navigation.navigate("WorkoutsScreen");
    }
  };

  const handleDelete = (index) => {
    setSchedule((prevSchedule) => {
      let updatedSchedule = JSON.parse(JSON.stringify(prevSchedule));
      updatedSchedule.splice(index, 1);
      return updatedSchedule;
    });
  };

  const handleEventDelete = ({ event }) => {
    setAllEvents((prevEvents) => {
      let updatedEvents = JSON.parse(JSON.stringify(prevEvents));
      updatedEvents = updatedEvents.filter((item) => item != event._id);
      return updatedEvents;
    });
    setEvents((prevEvents) => {
      let updatedEvents = JSON.parse(JSON.stringify(prevEvents));
      updatedEvents = updatedEvents.filter((item) => item._id != event._id);
      return updatedEvents;
    });
  };

  const handleAdd = (workoutID) => {
    let updatedSchedule = JSON.parse(JSON.stringify(schedule));
    updatedSchedule.push(workoutID);
    setSchedule(updatedSchedule);
    toggleModal();
  };

  const handleNewDayPress = (day) => {
    setScheduleVersion(1);
    setRestDayGap(() => {
      return "-";
    });
    setRestDays((prevRestDays) => {
      let updatedRestDays = JSON.parse(JSON.stringify(prevRestDays));
      updatedRestDays.push(day);
      return updatedRestDays;
    });
  };

  const handleOldDayPress = (day) => {
    setScheduleVersion(1);
    setRestDayGap(() => {
      return "-";
    });
    setRestDays((prevRestDays) => {
      let updatedRestDays = JSON.parse(JSON.stringify(prevRestDays));
      const index = updatedRestDays.indexOf(day);
      if (index > -1) {
        updatedRestDays.splice(index, 1);
      }
      return updatedRestDays;
    });
  };

  const handleEveryDay = (event) => {
    const newRestDayGap = event.nativeEvent.text;
    setRestDayGap(() => {
      return newRestDayGap;
    });

    setScheduleVersion(0);
    setRestDays(() => {
      let updatedRestDays = [];
      return updatedRestDays;
    });
    setSchedule(() => {
      let updatedSchedule = JSON.parse(JSON.stringify(schedule));
      updatedSchedule = updatedSchedule.filter((x) => x != "rest");
      return updatedSchedule;
    });
  };

  const ModalWorkout = ({ workout }) => {
    if (workout._id !== "rest") {
      return (
        <Pressable
          style={({ pressed }) => [
            styles.addPlanContainer || {},
            { opacity: pressed ? 0.5 : 1 },
          ]}
          onPress={() => handleAdd(String(workout._id))}
        >
          <SafeAreaView style={styles.workoutAddButton}>
            <Text style={styles.workoutAddButtonText}>+</Text>
          </SafeAreaView>
          <Text style={styles.planText}>{workout.name}</Text>
        </Pressable>
      );
    }
  };

  const Plan = (workout) => {
    if (workout) {
      if (String(workout.workout) != "rest") {
        const workoutData = useSelector(
          specificWorkout(String(workout.workout))
        );
        if (workoutData) {
          return (
            <Pressable
              style={({ pressed }) => [
                styles.planContainer || {},
                { opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={() =>
                navigation.navigate("AddWorkouts", {
                  workoutPlanParams: [workoutData, false],
                })
              }
            >
              <Pressable
                style={({ pressed }) => [
                  styles.deleteButton || {},
                  { opacity: pressed ? 0.5 : 1 },
                ]}
                onPress={() => handleDelete(workout.index)}
              >
                <Text style={styles.deleteButtonText}>-</Text>
              </Pressable>
              <Text style={styles.planText}>{workoutData.name}</Text>
            </Pressable>
          );
        }
      }
    }
  };

  const RestDays = (day) => {
    if (restDays.includes(day.day)) {
      return (
        <Pressable
          style={({ pressed }) => [
            styles.restDayContainerPressed || {},
            { opacity: pressed ? 0.5 : 1 },
          ]}
          onPress={() => {
            handleOldDayPress(day.day);
          }}
        >
          <Text style={styles.restDayText}>{day.day}</Text>
        </Pressable>
      );
    } else {
      return (
        <Pressable
          style={({ pressed }) => [
            styles.restDayContainer || {},
            { opacity: pressed ? 0.5 : 1 },
          ]}
          onPress={() => {
            handleNewDayPress(day.day);
          }}
        >
          <Text style={styles.restDayText}>{day.day}</Text>
        </Pressable>
      );
    }
  };

  const CalendarEventsContainer = (event) => {
    return (
      <SafeAreaView style={styles.eventContainer}>
        <Pressable
          style={({ pressed }) => [
            [styles.deleteButton, { marginTop: 3 }] || {},
            { opacity: pressed ? 0.5 : 1 },
          ]}
          onPress={() => handleEventDelete(event)}
        >
          <Text style={styles.deleteButtonText}>-</Text>
        </Pressable>
        <SafeAreaView style={{ flexDirection: "row" }}>
          <Text
            style={[styles.eventHeaderText, { maxWidth: 280 }]}
            numberOfLines={1}
          >
            {event.event.name}
          </Text>
        </SafeAreaView>
        <SafeAreaView
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.eventSubHeaderText}>
            {event.event.date} {event.event.time}
          </Text>
          <SafeAreaView style={{ maxWidth: "60%" }}>
            <Text style={[styles.eventHeaderText]}>{event.event.location}</Text>
          </SafeAreaView>
        </SafeAreaView>
        <Text style={styles.eventText}>{event.event.description}</Text>
      </SafeAreaView>
    );
  };

  const Rest = () => {
    return (
      <SafeAreaView style={styles.eventContainer}>
        <SafeAreaView style={styles.daysTextContainer}>
          <Text style={styles.daysBodyHeader}>Rest Day</Text>
        </SafeAreaView>
      </SafeAreaView>
    );
  };

  const CalendarWorkout = (date) => {
    if (schedule.length > 0) {
      let workoutPlan = null;
      const oneDay = 24 * 60 * 60 * 1000;
      const missedDays = Math.round((date.date - today) / oneDay);
      if (scheduleVersion == 0) {
        if (Number(restDayGap) < 1) {
          workoutPlan = schedule[missedDays % schedule.length];
        } else {
          if ((missedDays + 1) % (Number(restDayGap) + 1) == 0) {
            workoutPlan = "rest";
          } else {
            workoutPlan =
              schedule[
                (missedDays -
                  Math.trunc(missedDays / (Number(restDayGap) + 1))) %
                  schedule.length
              ];
          }
        }
      } else {
        let workoutDays = 0;
        if (restDays.includes(daysOfWeek[date.date.getDay()])) {
          workoutPlan = "rest";
        } else {
          for (let day = 0; day <= missedDays; day++) {
            let dayOfWeekIndex = (today.getDay() + day) % 7;
            if (!restDays.includes(daysOfWeek[dayOfWeekIndex])) {
              workoutDays += 1;
            }
          }
          workoutPlan = schedule[(workoutDays - 1) % schedule.length];
        }
      }

      const workout = useSelector(specificWorkout(workoutPlan));
      let reps = 0;
      let sets = 0;
      if (workoutPlan && workout) {
        if (workoutPlan != "rest") {
          for (var i = 0, l = workout.plan.length; i < l; i++) {
            sets += workout.plan[i].lifts.length;
            for (var j = 0, k = workout.plan[i].lifts.length; j < k; j++) {
              reps += Number(workout.plan[i].lifts[j].reps);
            }
          }
        }
        return (
          <SafeAreaView style={styles.planView}>
            {workoutPlan === "rest" && <Rest />}
            {workoutPlan != "rest" && (
              <Pressable
                style={({ pressed }) => [
                  styles.eventContainer || {},
                  { opacity: pressed ? 0.5 : 1 },
                ]}
                onPress={() =>
                  navigation.navigate("AddWorkouts", {
                    workoutPlanParams: [workout, false],
                  })
                }
              >
                <SafeAreaView style={styles.containerTitle}>
                  <Text style={styles.daysBodyHeader}>{workout.name}</Text>
                </SafeAreaView>
                <SafeAreaView
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.eventSubHeaderText}>
                    {`${
                      date.date.getMonth() + 1
                    }/${date.date.getDate()}/${date.date.getFullYear()}`}
                  </Text>
                  <Text style={styles.eventSubHeaderText}>
                    Est. Time: {workout.time}
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
    } else {
      return (
        <SafeAreaView style={styles.noEventView}>
          <Text style={styles.noEventText}>No Workout</Text>
        </SafeAreaView>
      );
    }
  };

  const CalendarEvents = (date) => {
    const formattedDate =
      String(date.date.getMonth() + 1) +
      "/" +
      String(date.date.getDate()) +
      "/" +
      String(date.date.getFullYear());
    const eventsList = events.filter(
      (event) => String(event.date) == String(formattedDate)
    );
    if (eventsList.length < 1) {
      return (
        <SafeAreaView style={styles.noEventView}>
          <Text style={styles.noEventText}>No Events</Text>
        </SafeAreaView>
      );
    } else {
      return (
        <SafeAreaView>
          <FlatList
            showsVerticalScrollIndicator={false}
            style={styles.planView}
            data={eventsList}
            renderItem={({ item, index }) => (
              <CalendarEventsContainer event={item} index={index} />
            )}
          />
        </SafeAreaView>
      );
    }
  };

  return (
    <SafeAreaView>
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 145 }}
        ListHeaderComponent={
          <SafeAreaView style={{ flex: 1 }}>
            <SafeAreaView style={styles.view}>
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                onPress={() => navigation.navigate("WorkoutsScreen")}
              >
                <Text style={styles.headerText}>Cancel</Text>
              </Pressable>
              <Text style={styles.header}>Edit Schedule</Text>
              {submit && (
                <Pressable
                  style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.headerText}>Submit</Text>
                </Pressable>
              )}
              {!submit && <Text style={styles.noSubmit}> </Text>}
            </SafeAreaView>
            <SafeAreaView style={styles.subView}>
              <Text style={styles.subHeaderText}>Plan</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.addButton || {},
                  { opacity: pressed ? 0.5 : 1 },
                ]}
                onPress={() => toggleModal()}
              >
                <Icon name="add" size={26} color="#FFFFFF" />
              </Pressable>
              <Modal isVisible={isModalVisible}>
                <SafeAreaView style={styles.modalView}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalExit || {},
                      { opacity: pressed ? 0.5 : 1 },
                    ]}
                    onPress={() => toggleModal()}
                  >
                    <Text style={styles.modalExitText}>X</Text>
                  </Pressable>
                  {workouts.length < 2 && (
                    <Text style={styles.noWorkouts}>No Workouts Added</Text>
                  )}
                  {workouts.length > 1 && (
                    <FlatList
                      showsVerticalScrollIndicator={false}
                      data={workouts}
                      renderItem={({ item }) => <ModalWorkout workout={item} />}
                      keyExtractor={(item) => item._id}
                    />
                  )}
                </SafeAreaView>
              </Modal>
            </SafeAreaView>
            <SafeAreaView>
              {schedule.length > 0 && (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.planView}
                  data={schedule}
                  renderItem={({ item, index }) => (
                    <Plan workout={item} index={index} />
                  )}
                />
              )}
              {schedule.length == 0 && (
                <Text style={styles.noWorkoutPlan}>No Added Workouts</Text>
              )}
            </SafeAreaView>
            <SafeAreaView>
              <Text style={styles.subRestHeaderText}>Rest:</Text>
              <SafeAreaView style={styles.restView}>
                <Text style={styles.restText}>Every</Text>
                <TextInput
                  placeholder="-"
                  placeholderTextColor={"black"}
                  maxLength={2}
                  keyboardType="numeric"
                  style={styles.restInput}
                  value={
                    restDayGap == "-" || restDayGap == -1 ? "" : `${restDayGap}`
                  }
                  onChange={(event) => handleEveryDay(event)}
                />
                <Text style={styles.restText}>Day(s)</Text>
              </SafeAreaView>
              <SafeAreaView style={styles.restView}>
                <Text style={styles.restMiddleText}>-Or-</Text>
              </SafeAreaView>
              <SafeAreaView>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  numColumns={4}
                  style={styles.restDaysView}
                  data={daysOfWeek}
                  renderItem={({ item }) => <RestDays day={item} />}
                />
              </SafeAreaView>
            </SafeAreaView>
            <SafeAreaView style={styles.subView}>
              <Text style={styles.subHeaderText}>Edit Specific Dates</Text>
            </SafeAreaView>
            <SafeAreaView style={styles.calendarContainer}>
              <CalendarPicker
                key={selectedDay}
                initialDate={selectedDay}
                previousTitle="<"
                nextTitle=">"
                initi
                monthTitleStyle={styles.titleStyle}
                yearTitleStyle={styles.titleStyle}
                textStyle={styles.subTitleStyle}
                previousTitleStyle={styles.arrowTitleStyle}
                nextTitleStyle={styles.arrowTitleStyle}
                onDateChange={(date) => changeDate(date)}
                onMonthChange={(month) => {
                  if (month > new Date()) {
                    setSelectedDay(month);
                  } else {
                    setSelectedDay(new Date());
                  }
                  setCurrentMonth(month.getMonth());
                }}
                selectedStartDate={selectedDay}
                todayBackgroundColor="#F0F0F0"
                selectedDayStyle={styles.selectedDay}
                customDatesStyles={customDatesStyles}
                restrictMonthNavigation={true}
                minDate={new Date()}
              />
            </SafeAreaView>
            <SafeAreaView style={styles.subView}>
              <Text style={styles.calendarSubHeader}>Workout</Text>
            </SafeAreaView>

            <SafeAreaView style={styles.subView}>
              <CalendarWorkout date={selectedDay} />
            </SafeAreaView>
            <SafeAreaView style={styles.subView}>
              <Text style={styles.calendarSubHeader}>Events</Text>
            </SafeAreaView>

            <SafeAreaView style={styles.subView}>
              <CalendarEvents date={selectedDay} />
            </SafeAreaView>
          </SafeAreaView>
        }
      ></FlatList>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: {
    flexDirection: "row",
    margin: 12,
    paddingTop: 20,
    justifyContent: "space-between",
  },
  subView: {
    flexDirection: "row",
    marginHorizontal: 15,
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 17,
    marginTop: 10,
    fontWeight: "800",
    color: "#00693E",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  noSubmit: {
    fontSize: 17,
    marginTop: 10,
    paddingHorizontal: 28,
    fontWeight: "800",
    color: "#00693E",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  subHeaderText: {
    fontSize: 20,
    marginTop: 10,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
  },
  subRestHeaderText: {
    fontSize: 18,
    marginHorizontal: 20,
    marginBottom: 10,
    fontWeight: "800",
    color: "#000000",
    textAlign: "left",
  },
  restView: {
    flexDirection: "row",
    justifyContent: "center",
  },
  restText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },
  restMiddleText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },
  restInput: {
    borderColor: "#000000",
    borderWidth: 1,
    marginHorizontal: 10,
    minWidth: 30,
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
  header: {
    fontSize: 24,
    textAlign: "center",
    paddingVertical: 5,
    fontWeight: "800",
    color: "#00693E",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  calendarContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    width: "95%",
    borderRadius: 15,
    backgroundColor: "white",
    alignSelf: "center",
    ShadowColor: "#000000",
    shadowOpacity: 0.6,
    ShadowOffset: { x: 0, y: -2 },
    ShadowRadius: 1,
  },
  titleStyle: {
    fontSize: 18,
    marginTop: 2,
    fontWeight: "800",
  },
  arrowTitleStyle: {
    fontSize: 16,
    paddingHorizontal: 5,
    paddingVertical: 3,
    fontWeight: "700",
  },
  subTitleStyle: {
    fontSize: 16,
    paddingVertical: 3,
    fontWeight: "700",
  },
  selectedDay: {
    backgroundColor: "#00693E",
  },
  addButton: {
    backgroundColor: "#00693E",
    borderRadius: 20,
    paddingLeft: 2,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  planView: {
    marginVertical: 10,
  },
  planContainer: {
    backgroundColor: "#FFFFFF",
    margin: 7,
    marginHorizontal: 10,
    paddingVertical: 25,
    paddingHorizontal: 25,
    borderRadius: 15,
    ShadowColor: "#000000",
    shadowOpacity: 0.2,
    ShadowOffset: { x: 0, y: 0 },
    ShadowRadius: 0.2,
    alignContent: "center",
  },
  planText: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  addPlanContainer: {
    backgroundColor: "#FFFFFF",
    marginVertical: 10,
    width: "100%",
    paddingVertical: 25,
    paddingHorizontal: 40,
    borderRadius: 15,
    ShadowColor: "#000000",
    shadowOpacity: 0.2,
    ShadowOffset: { x: 0, y: 0 },
    ShadowRadius: 0.2,
    alignContent: "center",
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    left: 5,
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
  restDaysView: {
    marginVertical: 10,
    alignItems: "center",
  },
  restDayContainer: {
    backgroundColor: "#FFFFFF",
    margin: 10,
    marginHorizontal: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 15,
    ShadowColor: "#000000",
    shadowOpacity: 0.4,
    ShadowOffset: { x: 0, y: 0 },
    ShadowRadius: 0.1,
    alignContent: "center",
  },
  restDayContainerPressed: {
    backgroundColor: "#00693E",
    margin: 10,
    marginHorizontal: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 15,
    ShadowColor: "#000000",
    shadowOpacity: 0.4,
    ShadowOffset: { x: 0, y: 0 },
    ShadowRadius: 0.1,
    alignContent: "center",
  },
  restDayText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  workoutAddButton: {
    position: "absolute",
    top: 5,
    left: 5,
    height: 20,
    width: 20,
    borderWidth: 2,
    borderRadius: 20,
    borderColor: "#00693E",
  },
  workoutAddButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#00693E",
    textAlign: "center",
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalExit: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  modalExitText: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },
  eventContainer: {
    marginVertical: 5,
    minWidth: "100%",
    maxWidth: "100%",
    backgroundColor: "white",
    alignItems: "center",
    borderRadius: 16,
    ShadowColor: "#000000",
    shadowOpacity: 0.3,
    ShadowOffset: { x: 3, y: 6 },
    ShadowRadius: 3,
  },
  eventHeaderText: {
    fontFamily: "Lato_700Bold",
    margin: 10,
    fontSize: 16,
  },
  eventSubHeaderText: {
    fontFamily: "Lato_700Bold",
    margin: 10,
    fontSize: 16,
    maxWidth: "100%",
  },
  eventText: {
    fontFamily: "Lato_400Regular",
    textAlign: "left",
    fontSize: 14,
    paddingTop: 4,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  calendarSubHeader: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
  },
  containerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  daysTextContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  daysBodyHeader: {
    margin: 10,
    fontSize: 20,
    fontWeight: "700",
    alignSelf: "center",
    color: "#000000",
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
    color: "black",
  },
  noEventView: {
    width: "100%",
    alignItems: "center",
  },
  noEventText: {
    marginVertical: 10,
    fontSize: 16,
    fontWeight: "400",
  },
  noWorkouts: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
  },
  noWorkoutPlan: {
    textAlign: "center",
    fontSize: 20,
    marginVertical: 10,
    fontWeight: "600",
  },
});
