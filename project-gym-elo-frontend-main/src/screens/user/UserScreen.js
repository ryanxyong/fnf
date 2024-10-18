// Note to grader: following discussion with Prof Tregubov please note that GPT was used
// in the making of this file. Specifically it helped with implementing the graph functions
// as they exist and helping me figure out the logic for the calendar picker.



import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { AntDesign } from "@expo/vector-icons";
import { getUser } from "../../features/users/userSlice";
import CalendarPicker from "react-native-calendar-picker";
import { queryDate } from "../../actions/server";
import { LineChart } from "react-native-chart-kit";


// Format date for calendar funcitonality 
function formatDate(date) {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

// This one is just for the graph 
// makes the analytics a little easier on the eye
function dateForGraph(date) {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [month, day].join("/");
}

// Build out data structure for exercise records
// Designed and implemented by Ryan and Sam 
function buildExRecs(dateObj) {
  let exRecs = {};
    let lim = dateObj.workoutData;
    Object.keys(lim).forEach((date) => {
      lim[date].forEach((ex) => {
        if (exRecs[ex.name] === undefined) {
          exRecs[ex.name] = {};
        }
        ex.lifts.forEach((lift) => {
          if (exRecs[ex.name][date] === undefined) {
            exRecs[ex.name][date] = 0;
          }
          if (lift.reps == 0) {
            exRecs[ex.name][date] += lift.amount;
          } else {
            exRecs[ex.name][date] += lift.amount * lift.reps;
          }
        });
      });
    });
  return exRecs;
}

// Takes data from buildExRecs and builds out the features for the graph
// Also designed and implemented by Ryan and Sam
function buildFeatures(exRecs) {
  let res = {};
  Object.keys(exRecs).forEach((ex) => {
    let temp = {
      labels: [],
      data: [],
    };

    Object.keys(exRecs[ex]).forEach((date) => {
      // make sure that the year is not present on the graph cos who cares
      temp.labels.push(dateForGraph(date));
      temp.data.push(exRecs[ex][date]);
    });
    res[ex] = temp;
  });
  return res;
}

// Lastly, transform the data into a plottable form
// Implemented and designed by Ryan and Sam
function transformExerciseData(exerciseData) {
  return Object.keys(exerciseData).map((exercise) => ({
    name: exercise,
    labels: exerciseData[exercise].labels,
    data: exerciseData[exercise].data,
  }));
}

export default function UserScreen({ navigation }) {
  const [selectedView, setSelectedView] = useState("Calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutData, setWorkoutData] = useState([]);
  const [transformedChartData, setTransformedChartData] = useState([]);
  const layout = useWindowDimensions();
  const [routes] = useState([
    { key: "pastWorkouts", title: "Workouts" },
    { key: "communities", title: "Communities" },
  ]);

  const user = useSelector(getUser);
  console.log("data", workoutData);

  useEffect(() => {
    const getDateObj = async () => {
      if (user && user._id) {
        const dateObj = await queryDate(user._id);
        // const dateObj = await queryDate("65da5e88e70a9ff29f15d294");
        let out = buildExRecs(dateObj);
        let features = buildFeatures(out);
        let transformedData = transformExerciseData(features);
        setTransformedChartData(transformedData); // Update state with the new data
      }
    };
    const formattedDate = formatDate(new Date());
    enactDateChange(formattedDate);
    getDateObj();
  }, [user, user.workouts]); // Depend on user._id and user.workouts so it re-runs when this id changes

  const updateWorkoutDataForDate = (dataArray, date) => {
    console.log("DATA ARRAY", dataArray)
    if (dataArray && dataArray.workoutData[date]) {
      const formattedWorkouts = dataArray.workoutData[date].map(
        (workout) => ({
          name: workout.name,
          max: workout.max,
          unit: workout.unit,
          lifts: workout.lifts,
        })
      );
      setWorkoutData(formattedWorkouts);
    } else {
      setWorkoutData([]);
    }
  };

  const enactDateChange = async (formattedDate) => {
    // let dateObject = await queryDate(user._id);
    let dateObject = await queryDate(user._id);
    updateWorkoutDataForDate(dateObject, formattedDate);
  };

  const CalendarWorkout = (date) => {
    console.log(date);
    return (
      <SafeAreaView style={{ width: "100%" }}>
        {workoutData.length > 0 ? (
          workoutData.map((workout, index) => (
            <View key={index} style={styles.workoutItem}>
              <SafeAreaView style={styles.workoutTitleView}>
                <Text style={styles.workoutTitle}>
                  Exercise: {workout.name}
                </Text>
              </SafeAreaView>

              <Text style={styles.workoutText}>
                Max: {workout.max} {workout.unit}
              </Text>
              {workout.lifts.map((lift, liftIndex) => (
                <Text key={liftIndex} style={styles.workoutText}>
                  Lift: {lift.amount} {workout.unit} for {lift.reps} reps
                </Text>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.noWorkoutText}>
            No workout data available for this date.
          </Text>
        )}
      </SafeAreaView>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <FlatList
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")} //navigation.navigate("UserProfile")}
              style={{ position: "absolute", right: 20, top: 20, zIndex: 1 }}
            >
              <AntDesign name="setting" size={30} />
            </TouchableOpacity>

            <View style={styles.userInfoContainer}>
              <Image
                source={{ uri: user.profilePic }}
                style={styles.profilePicImage}
              />
              <SafeAreaView>
                <Text style={styles.header}>{user.firstName}</Text>
              </SafeAreaView>
            </View>

            <View style={styles.viewSelector}>
              <Pressable
                style={[
                  styles.viewOption,
                  selectedView === "Calendar" ? styles.selectedOption : {},
                ]}
                onPress={() => setSelectedView("Calendar")}
              >
                <AntDesign
                  name="calendar"
                  size={24}
                  color={selectedView === "Calendar" ? "white" : "black"}
                />
              </Pressable>
              <Pressable
                style={[
                  styles.viewOption,
                  selectedView === "Analytics" ? styles.selectedOption : {},
                ]}
                onPress={() => setSelectedView("Analytics")}
              >
                <AntDesign
                  name="areachart"
                  size={24}
                  color={selectedView === "Analytics" ? "white" : "black"}
                />
              </Pressable>
            </View>

            {/* Existing content continues here */}
            {selectedView === "Calendar" && (
              <SafeAreaView>
                <SafeAreaView style={styles.calendarContainer}>
                  <CalendarPicker
                    previousTitle="<"
                    nextTitle=">"
                    onDateChange={(date) => {
                      const formattedDate = formatDate(date);
                      setSelectedDate(formattedDate);
                      enactDateChange(formattedDate);
                    }}
                    dayShape="circle"
                    textStyle={{
                      fontFamily: "Lato_700Bold",
                      color: "#000000",
                    }}
                    todayTextStyle={{ color: "black", fontWeight: "700" }}
                    selectedDayColor="#00693E"
                    selectedDayTextColor="white"
                    scaleFactor={375}
                    maxDate={new Date()}
                    monthTitleStyle={styles.titleStyle}
                    yearTitleStyle={styles.titleStyle}
                    previousTitleStyle={styles.arrowTitleStyle}
                    nextTitleStyle={styles.arrowTitleStyle}
                  />
                </SafeAreaView>
                <SafeAreaView style={styles.mainView}>
                  <Text style={styles.calendarSubHeader}>Workout Data</Text>
                </SafeAreaView>

                <SafeAreaView style={styles.subView}>
                  <CalendarWorkout date={selectedDate} />
                </SafeAreaView>
              </SafeAreaView>
            )}

            {selectedView === "Analytics" && (
              <SafeAreaView
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {transformedChartData.map((exercise, index) => (
                  <View
                    key={index}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      marginVertical: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        marginBottom: 5,
                      }}
                    >
                      {exercise.name}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginVertical: 5,
                      }}
                    >
                      <Text
                        style={{ fontSize: 16, color: "black", marginLeft: 20 }}
                      >
                        Daily Total ↑
                      </Text>
                      <View
                        style={{
                          height: 20, // Adjust the thickness of the bar
                          width: 2, // Adjust the length of the bar
                          backgroundColor: "black", // Adjust the color of the bar
                          marginHorizontal: 10, // Adjust the space between the text and the bar
                        }}
                      ></View>
                      <Text style={{ fontSize: 16, color: "black" }}>
                        Date →
                      </Text>
                    </View>

                    <LineChart
                      data={{
                        labels: exercise.labels,
                        datasets: [
                          {
                            data: exercise.data,
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // sets the line color to white
                            strokeWidth: 4
                          },
                        ],
                      }}
                      width={layout.width - 40}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix="" // Edit this line to change units
                      withInnerLines={false} // Remove grid lines
                      yAxisInterval={1}
                      chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#004A2F", // Darker green
                        backgroundGradientTo: "#678978", // Lighter green
                        decimalPlaces: 0,
                        color: (opacity = 0) => `rgba(255, 255, 255, ${opacity})`, // Make grid lines invisible (set to white if needed)
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Set axes text color to white
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: "6",
                          strokeWidth: "2",
                          backgroundColor: "#ffffff" // White dot inner color
                        },
                        useShadowColorFromDataset: false, // Ensures that the gradient applies only to the background, not the datasets
                        fillShadowGradient: '#678978', // Use a solid color for the fill beneath the line
                        fillShadowGradientOpacity: 1, // Set the opacity to 1 for a solid fill
                      }}
                      bezier
                      style={{
                        marginVertical: 8,
                        borderRadius: 16,
                      }}
                      xLabelsOffset={0}
                    />
                  </View>
                ))}
              </SafeAreaView>
            )}
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginBottom: 10,
    color: "#0066ff",
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-around", // Adjust as needed for better centering
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 5, // Adjust the padding for optimal spacing
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center", // Ensure text is centered
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "black",
    marginTop: 5, // Add space above the line
    marginBottom: 10, // Add space below the line for separation from next elements
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Add background color for dim effect
  },
  workoutItem: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    marginVertical: 10, // Add vertical margin for better spacing
    alignItems: "center", // Align items to the start
    backgroundColor: "white",
  },
  workoutTitleView: {
    marginBottom: 10, // Add some margin below the title for spacing
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  workoutText: {
    // Add new style for regular workout text
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5, // Space out each piece of text
  },
  noWorkoutText: {
    // Add new style for regular workout text
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
    marginVertical: 20, // Space out each piece of text
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  workoutContainer: {
    padding: 10,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // or 'stretch' or 'contain'
    justifyContent: "center",
  },
  screenContainer: {},
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center", // Center content horizontally
    alignItems: "center", // Center content vertically
    height: 60, // Set the height
  },
  userInfoContainer: {
    flexDirection: "column",
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginHorizontal: 12,
    paddingTop: 90,
    marginTop: -80,
    marginBottom: 10,
  },
  header: {
    fontFamily: "Lato_700Bold",
    textAlign: "left",
    fontSize: 26,
    fontWeight: "bold",
    color: "black",
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0.5,
    marginTop: -6,
  },
  subheader: {
    fontFamily: "Lato_700Bold",
    textAlign: "left",
    fontSize: 30,
    color: "black",
    marginTop: 15,
    marginBottom: 12,
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0.3,
  },
  profilePicImage: {
    width: 120,
    height: 120,
    borderRadius: 70,
    borderWidth: 2,
  },
  line: {
    borderBottomColor: "black",
    borderBottomWidth: 1.5,
  },
  calendarContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    width: "95%",
    borderRadius: 15,
    backgroundColor: "white",
    alignSelf: "center",
    ShadowColor: "#000000",
    shadowOpacity: 0.6,
    ShadowOffset: { x: 0, y: -2 },
    ShadowRadius: 1,
  },
  calendarSubHeader: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "800",
  },
  subHeadingText: {
    fontFamily: "Lato_700Bold",
    fontWeight: 800,
    fontSize: 26,
    paddingLeft: 20,
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0.5,
  },
  row_container: {
    flexDirection: "row",
  },
  eventContainer: {
    width: 360,
    height: 135,
    marginRight: 40,
    marginBottom: 14,
    backgroundColor: "#ACCAAF",
    alignItems: "center",
    borderRadius: 16,
    ShadowColor: "#000000",
    shadowOpacity: 0.6,
    ShadowOffset: { x: 3, y: 6 },
    ShadowRadius: 3,
  },
  flatlistItem: {
    backgroundColor: "#ACCAAF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 10,
    marginTop: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  eventListContainer: {
    flex: 1,
    marginTop: 30,
  },
  eventListHeaderContainer: {
    flexDirection: "row",
    zIndex: 999,
    height: 50,
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 10,
  },
  eventListHeader: {
    fontFamily: "Lato_700Bold",
    fontSize: 26,
    paddingLeft: 20,
    textShadowColor: "#000000",
    textShadowOffset: { width: 0.2, height: 0.2 },
    textShadowRadius: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginBottom: 10,
    color: "#0066ff",
    fontWeight: "700",
  },
  viewSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    borderRadius: 10, // Added for a slight rounded corner, remove if you want it completely rectangular
  },
  viewOption: {
    paddingVertical: 10, // Increased padding for better spacing
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 10, // Match with viewSelector for consistent rounded corners
    backgroundColor: "lightgrey", // Change as needed
    alignItems: "center", // Ensure contents are centered
    justifyContent: "center", // Ensure contents are centered
  },
  selectedOption: {
    backgroundColor: "#000000", // Change as needed
  },
  viewOptionText: {
    color: "white", // Change as needed
    fontSize: 16,
    textAlign: "center",
  },
  favoritesContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  favoritesHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  exerciseItem: {
    fontSize: 18,
    marginBottom: 5,
  },
  mainView: {
    marginTop: 10,
    flexDirection: "row",
    marginHorizontal: 15,
    justifyContent: "space-between",
  },
  subView: {
    flexDirection: "row",
    marginHorizontal: 15,
    justifyContent: "space-between",
    marginBottom: 50,
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
});
