import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import uuid from "react-native-uuid";
import {
  selectWorkout,
  updateWorkout,
} from "../../features/workouts/workoutSlice";
import Modal from "react-native-modal";
import { workoutOptions } from "./workoutInformation";
import { createWorkout, updateAllOfWorkout } from "../../actions/server";
import { SelectList } from "react-native-dropdown-select-list";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getUser } from "../../features/users/userSlice";

export default function AddWorkoutsScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const workouts = useSelector(selectWorkout);
  const inputRef = useRef(null);
  const { workoutPlanParams } = route.params;
  const newWorkout =
    workoutPlanParams.length > 1 ? workoutPlanParams[1] : false;
  const [workoutPlan, setWorkoutPlan] = useState(workoutPlanParams[0]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isNewModalVisible, setNewModalVisible] = useState(false);
  const [selected, setSelected] = useState("");
  const [newPlan, setPlan] = useState("");
  useEffect(() => {
    handleChange("unit", newPlan._id, -1, selected);
  }, [newPlan._id]);

  useEffect(() => {
    const newExercise = {
      _id: uuid.v4(),
      name: "hidden",
      unit: "lbs",
      units: ["lbs", "kgs"],
      lifts: [],
    };
    let updatedWorkoutPlan = JSON.parse(JSON.stringify(workoutPlan));

    updatedWorkoutPlan.plan.push(newExercise);
    setWorkoutPlan(updatedWorkoutPlan);
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const toggleNewModal = () => {
    setNewModalVisible(!isNewModalVisible);
  };

  const handleDelete = (workoutID) => {
    setWorkoutPlan((prevWorkoutPlan) => {
      const updatedWorkoutPlan = JSON.parse(JSON.stringify(prevWorkoutPlan));

      updatedWorkoutPlan.plan = updatedWorkoutPlan.plan.filter(
        (item) => item._id !== workoutID
      );

      return updatedWorkoutPlan;
    });
  };
  const handleRemove = (workoutID, setID) => {
    setWorkoutPlan((prevWorkoutPlan) => {
      const updatedWorkoutPlan = JSON.parse(JSON.stringify(prevWorkoutPlan));
      const planIndex = updatedWorkoutPlan.plan.findIndex(
        (obj) => obj._id === workoutID
      );

      if (planIndex >= 0) {
        updatedWorkoutPlan.plan[planIndex].lifts = updatedWorkoutPlan.plan[
          planIndex
        ].lifts.filter((lift) => lift._id !== setID);
      }

      return updatedWorkoutPlan;
    });
  };

  const handleAddSet = (workoutID) => {
    const updatedWorkoutPlan = JSON.parse(JSON.stringify(workoutPlan));
    const planIndex = updatedWorkoutPlan.plan.findIndex(
      (obj) => obj._id === workoutID
    );
    if (updatedWorkoutPlan.plan[planIndex].lifts.length > 0) {
      const index = updatedWorkoutPlan.plan[planIndex].lifts.length - 1;
      const id = updatedWorkoutPlan.plan[planIndex].lifts[index]._id;
      if (planIndex >= 0) {
        updatedWorkoutPlan.plan[planIndex].lifts.push({
          ...updatedWorkoutPlan.plan[planIndex].lifts[index],
        });
      }
      updatedWorkoutPlan.plan[planIndex].lifts[index + 1]._id = id + 1;
    } else {
      if (updatedWorkoutPlan.plan[planIndex].unit == "time") {
        updatedWorkoutPlan.plan[planIndex].lifts.push({
          amount: "00:00:00",
          reps: 0,
        });
      } else {
        updatedWorkoutPlan.plan[planIndex].lifts.push({
          amount: 0,
          reps: 0,
        });
      }
    }

    setWorkoutPlan(updatedWorkoutPlan);
  };

  const handleAddWorkout = (item) => {
    const newExercise = {
      _id: uuid.v4(),
      name: item.exercise,
      unit: item.units[0],
      units: item.units,
      lifts: [],
    };
    toggleNewModal();
    let updatedWorkoutPlan = JSON.parse(JSON.stringify(workoutPlan));

    updatedWorkoutPlan.plan.unshift(newExercise);
    setWorkoutPlan(updatedWorkoutPlan);
  };

  const handleSubmit = async () => {
    if (inputRef.current && inputRef.current.isFocused()) {
      inputRef.current.blur();
      return;
    }
    const updatedWorkoutPlan = { ...workoutPlan };
    updatedWorkoutPlan.plan.pop();
    if (newWorkout) {
      createWorkout(updatedWorkoutPlan, user, workouts, dispatch);
    } else {
      dispatch(
        updateWorkout({
          id: workoutPlanParams[0]._id,
          workout: updatedWorkoutPlan,
        })
      );
      await updateAllOfWorkout(updatedWorkoutPlan._id, updatedWorkoutPlan);
    }

    navigation.goBack();
  };

  const handleChange = (type, workout, setNum, newVal) => {
    if (workout) {
      const updatedWorkoutPlan = JSON.parse(JSON.stringify(workoutPlan));
      const planIndex = updatedWorkoutPlan.plan.findIndex(
        (obj) => obj._id === workout
      );
      if (type === "amount") {
        updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount = newVal;
        setWorkoutPlan(updatedWorkoutPlan);
      } else if (type === "title") {
        updatedWorkoutPlan.plan[planIndex].name = newVal.exercise;
        updatedWorkoutPlan.plan[planIndex].units = newVal.units;
        updatedWorkoutPlan.plan[planIndex].unit = newVal.units[0];
        setWorkoutPlan(updatedWorkoutPlan);
        toggleModal();
      } else if (type === "unit") {
        updatedWorkoutPlan.plan[planIndex].unit = newVal;
        if (
          newVal == "time" &&
          updatedWorkoutPlan.plan[planIndex].lifts.length > 0
        ) {
          updatedWorkoutPlan.plan[planIndex].lifts = [
            { amount: "00:00:00", reps: 0 },
          ];
        } else if (updatedWorkoutPlan.plan[planIndex].lifts.length > 0) {
          if (
            updatedWorkoutPlan.plan[planIndex].lifts[0].amount
              .toString()
              .includes(":")
          ) {
            updatedWorkoutPlan.plan[planIndex].lifts = [{ amount: 0, reps: 0 }];
          }
        }
        setWorkoutPlan(updatedWorkoutPlan);
      } else if (type === "time1") {
        updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount =
          newVal.padStart(2, "0") +
          updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount.substring(
            2,
            8
          );
        setWorkoutPlan(updatedWorkoutPlan);
      } else if (type === "time2") {
        if (newVal > 60) {
          updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount =
            updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount.substring(
              0,
              3
            ) +
            "60" +
            updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount.substring(
              5
            );
        } else {
          updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount =
            updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount.substring(
              0,
              3
            ) +
            newVal.padStart(2, "0") +
            updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount.substring(
              5
            );
        }

        setWorkoutPlan(updatedWorkoutPlan);
      } else if (type === "time3") {
        if (newVal > 60) {
          updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount =
            updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount.substring(
              0,
              6
            ) + "60";
        } else {
          updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount =
            updatedWorkoutPlan.plan[planIndex].lifts[setNum].amount.substring(
              0,
              6
            ) + newVal.padStart(2, "0");
        }

        setWorkoutPlan(updatedWorkoutPlan);
      } else {
        updatedWorkoutPlan.plan[planIndex].lifts[setNum].reps = newVal;
        setWorkoutPlan(updatedWorkoutPlan);
      }
    }
  };

  const handleTitleChange = (newVal) => {
    const updatedWorkoutPlan = JSON.parse(JSON.stringify(workoutPlan));
    updatedWorkoutPlan.name = newVal;

    setWorkoutPlan(updatedWorkoutPlan);
  };

  const ModalWorkoutOption = ({ plan, workout }) => {
    let workoutUnitsText = "";
    workout.units.forEach(
      (element) => (workoutUnitsText = element + "/" + workoutUnitsText)
    );

    workoutUnitsText = workoutUnitsText.slice(0, -1);

    return (
      <SafeAreaView style={styles.modalContainer}>
        <SafeAreaView style={styles.modalExerciseView}>
          <Text style={styles.modalExercise}>{workout.exercise}</Text>
        </SafeAreaView>

        {workoutUnitsText && (
          <Text style={styles.modalUnits}>{workoutUnitsText}</Text>
        )}
        {!workoutUnitsText && <Text style={styles.modalUnits}>None</Text>}
        <Pressable
          style={styles.modalAddButton}
          onPress={() => {
            handleChange("title", plan._id, 0, workout);
          }}
        >
          <Text style={styles.modalAddText}>Add +</Text>
        </Pressable>
      </SafeAreaView>
    );
  };

  const Plan = ({ plan }) => {
    return (
      <SafeAreaView style={styles.workoutView}>
        <SafeAreaView style={{ flex: 4 }}>
          {plan.name != "hidden" && (
            <SafeAreaView
              style={{
                marginTop: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <SafeAreaView>
                <Text numberOfLines={2} style={styles.workoutName}>
                  {plan.name}
                </Text>
              </SafeAreaView>
              <SafeAreaView style={{ flexDirection: "row" }}>
                <SafeAreaView style={styles.selectListView}>
                  {plan.units.length > 1 && (
                    <SelectList
                      setSelected={(value) => {
                        setSelected(value);
                        setPlan(plan);
                      }}
                      data={plan.units}
                      search={false}
                      defaultOption={{
                        key: plan.unit,
                        value: plan.unit,
                      }}
                      dropdownStyles={styles.selectList}
                      boxStyles={{
                        padding: 0,
                        borderRadius: 30,
                        borderWidth: 2,
                        borderColor: "#00693E",
                      }}
                      dropdownTextStyles={styles.selectListHeader}
                      inputStyles={styles.selectListHeader}
                    />
                  )}
                </SafeAreaView>
                <Pressable
                  style={({ pressed }) => [
                    styles.button || {},
                    { opacity: pressed ? 0.5 : 1 },
                  ]}
                  onPress={() => handleAddSet(plan._id)}
                >
                  <Text style={styles.buttonText}>add set</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.button || {},
                    { opacity: pressed ? 0.5 : 1 },
                  ]}
                  onPress={() => handleDelete(plan._id)}
                >
                  <Text style={styles.deleteButtonText}>delete</Text>
                </Pressable>
              </SafeAreaView>
            </SafeAreaView>
          )}
          {plan.name == "hidden" && (
            <SafeAreaView
              style={{
                color: "transparent",
                backgroundColor: "transparent",
                borderWidth: 0,
                borderColor: "transparent",
                maxWidth: 0,
                maxHeight: 0,
                right: 100,
              }}
            >
              {plan.units.length > 1 && (
                <SelectList
                  setSelected={(value) => {
                    setSelected(value);
                    setPlan(plan);
                  }}
                  data={plan.units}
                  search={false}
                  defaultOption={{
                    key: plan.unit,
                    value: plan.unit,
                  }}
                />
              )}
            </SafeAreaView>
          )}
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
              <FlatList
                data={workoutOptions.sort((a, b) =>
                  a.exercise.localeCompare(b.exercise)
                )}
                renderItem={({ item }) => (
                  <ModalWorkoutOption plan={plan} workout={item} />
                )}
                numColumns={2}
                showsVerticalScrollIndicator={false}
              />
            </SafeAreaView>
          </Modal>

          <FlatList
            showsVerticalScrollIndicator={false}
            data={plan.lifts}
            renderItem={({ item, index }) => (
              <SafeAreaView style={styles.containerText}>
                <SafeAreaView style={styles.containerTextCol}>
                  <Text style={styles.setNumber}>Set {index + 1}</Text>
                  <SafeAreaView style={styles.containerText}>
                    
                    {plan.units.length == 0 && (
                      <SafeAreaView style={styles.sets}>
                        <TextInput
                          ref={inputRef}
                          defaultValue={`${item.amount}`}
                          onBlur={(event) =>
                            handleChange(
                              "amount",
                              plan._id,
                              index,
                              event.nativeEvent.text
                            )
                          }
                          style={styles.workoutInput}
                          type="numeric"
                          inputMode="numeric"
                          maxLength={4}
                        />
                        <Text style={styles.workoutBodyHeader}>reps</Text>
                      </SafeAreaView>
                    )}
                    {plan.unit == "time" && (
                      <SafeAreaView style={styles.sets}>
                        <TextInput
                          ref={inputRef}
                          defaultValue={item.amount.substring(0, 2)}
                          onBlur={(event) =>
                            handleChange(
                              "time1",
                              plan._id,
                              index,
                              event.nativeEvent.text
                            )
                          }
                          style={styles.workoutInput}
                          type="numeric"
                          inputMode="numeric"
                          maxLength={2}
                        />
                        <Text style={styles.timeColon}>:</Text>
                        <TextInput
                          ref={inputRef}
                          defaultValue={item.amount.substring(3, 5)}
                          onBlur={(event) =>
                            handleChange(
                              "time2",
                              plan._id,
                              index,
                              event.nativeEvent.text
                            )
                          }
                          style={styles.workoutInput}
                          type="numeric"
                          inputMode="numeric"
                          maxLength={2}
                        />
                        <Text style={styles.timeColon}>:</Text>
                        <TextInput
                          ref={inputRef}
                          defaultValue={item.amount.substring(6)}
                          onBlur={(event) =>
                            handleChange(
                              "time3",
                              plan._id,
                              index,
                              event.nativeEvent.text
                            )
                          }
                          style={styles.workoutInput}
                          type="numeric"
                          inputMode="numeric"
                          maxLength={2}
                        />
                        <Text style={styles.workoutBodyHeader}>time</Text>
                      </SafeAreaView>
                    )}
                    {(plan.unit == "kgs" || plan.unit == "lbs") && (
                      <SafeAreaView style={styles.sets}>
                        <TextInput
                          ref={inputRef}
                          defaultValue={`${item.reps}`}
                          onBlur={(event) =>
                            handleChange(
                              "reps",
                              plan._id,
                              index,
                              event.nativeEvent.text
                            )
                          }
                          style={styles.workoutInput}
                          type="numeric"
                          inputMode="numeric"
                          maxLength={4}
                        />
                        <Text style={styles.workoutBodyHeader}>reps</Text>
                      </SafeAreaView>
                    )}
                    {plan.units.length > 0 && plan.unit != "time" && (
                      <SafeAreaView style={styles.sets}>
                        <TextInput
                          ref={inputRef}
                          defaultValue={`${item.amount}`}
                          onBlur={(event) => {
                            handleChange(
                              "amount",
                              plan._id,
                              index,
                              event.nativeEvent.text
                            );
                          }}
                          style={styles.workoutInput}
                          type="numeric"
                          inputMode="numeric"
                          maxLength={4}
                        />
                        <Text style={styles.workoutBodyHeader}>
                          {plan.unit}
                        </Text>
                      </SafeAreaView>
                    )}
                    <Pressable
                      style={({ pressed }) => [
                        styles.deleteButton || {},
                        { opacity: pressed ? 0.5 : 1 },
                      ]}
                      onPress={() => handleRemove(plan._id, item._id)}
                    >
                      <AntDesign name="minus" size={24} color="red" />
                    </Pressable>
                  </SafeAreaView>
                </SafeAreaView>
              </SafeAreaView>
            )}
            keyExtractor={(item) => "key" + item._id}
          />
        </SafeAreaView>
      </SafeAreaView>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SafeAreaView style={styles.view}>
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerText}>Cancel </Text>
        </Pressable>
        <TextInput
          placeholder="New Workout"
          placeholderTextColor={"black"}
          ref={inputRef}
          autoFocus={true}
          style={styles.header}
          defaultValue={workoutPlan.name}
          onBlur={(event) => handleTitleChange(event.nativeEvent.text)}
          maxLength={15}
        />
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
          onPress={handleSubmit}
        >
          <Text style={styles.headerText}>Submit</Text>
        </Pressable>
      </SafeAreaView>
      <SafeAreaView>
        <Pressable
          style={({ pressed }) => [
            styles.newTextContainer || {},
            { opacity: pressed ? 0.5 : 1 },
          ]}
          onPress={toggleNewModal}
        >
          <Text style={styles.newText}>Add Workout +</Text>
        </Pressable>
      </SafeAreaView>
      <Modal isVisible={isNewModalVisible}>
        <SafeAreaView style={styles.modalView}>
          <Pressable
            style={({ pressed }) => [
              styles.modalExit || {},
              { opacity: pressed ? 0.5 : 1 },
            ]}
            onPress={() => toggleNewModal()}
          >
            <Text style={styles.modalExitText}>X</Text>
          </Pressable>
          <FlatList
            data={workoutOptions.sort((a, b) =>
              a.exercise.localeCompare(b.exercise)
            )}
            renderItem={({ item }) => (
              <SafeAreaView style={styles.modalContainer}>
                <SafeAreaView style={styles.modalExerciseView}>
                  <Text style={styles.modalExercise}>{item.exercise}</Text>
                </SafeAreaView>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalAddButton || {},
                    { opacity: pressed ? 0.5 : 1 },
                  ]}
                  onPress={() => handleAddWorkout(item)}
                >
                  <Text style={styles.modalAddText}>Add +</Text>
                </Pressable>
              </SafeAreaView>
            )}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
      <KeyboardAwareScrollView style={{ flex: 4 }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 125 }}
          data={workoutPlan.plan}
          renderItem={({ item }) => <Plan plan={item} />}
          keyExtractor={(item) => "key" + item._id}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
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
  containerText: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flex: 1,
  },
  containerTextCol: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    flex: 1,
  },
  workoutView: {
    flexDirection: "column",
    marginBottom: 15,
    marginHorizontal: 15,
  },
  workoutContainer: {
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 10,
  },
  workoutName: {
    flex: 1,
    textAlign: "left",
    maxWidth: "53%",
    minWidth: "53%",
    fontSize: 17,
    fontWeight: "900",
    color: "#00693E",
    marginTop: 4,
    textDecorationLine: "underline",
  },
  setNumber: {
    flex: 1,
    paddingTop: 4,
    textAlign: "left",
    fontSize: 15,
    fontWeight: "900",
    color: "#000000",
  },
  sets: { flexDirection: "row", flex: 1, marginVertical: 5 },
  workoutHeader: {
    fontSize: 25,
    fontWeight: "900",
    alignSelf: "flex-start",
    color: "#00693E",
  },
  workoutBodyHeader: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
    paddingBottom: 15,
  },
  selectListView: {
    marginTop: -7,
    marginLeft: -88,
    maxWidth: "38%",
    minWidth: "38%",
  },
  selectListHeader: {
    marginHorizontal: -2,
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },
  workoutInput: {
    marginHorizontal: 15,
    paddingHorizontal: 20,
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
    backgroundColor: "white",
    borderRadius: 20,
  },
  button: {
    paddingTop: 7,
    marginLeft: 10,
    height: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "white",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "left",
    color: "#00693E",
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "left",
    color: "red",
  },
  deleteButton: {
    marginTop: 14,
    paddingTop: 3,
    height: 30,
    paddingHorizontal: 5,
    borderRadius: 15,
    backgroundColor: "white",
  },
  newTextContainer: {
    backgroundColor: "#00693E",
    borderRadius: 50,
    marginHorizontal: 130,
    marginBottom: 20,
  },
  newText: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: "white",

    paddingVertical: 5,
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 30,
  },
  modalContainer: {
    backgroundColor: "white",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
    borderRadius: 20,
    margin: 4,
  },
  modalExerciseView: {
    justifyContent: "center",
    maxHeight: 50,
    minHeight: 50,
    marginTop: 4,
  },
  modalExercise: {
    verticalAlign: "middle",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
  },
  modalUnits: {
    fontSize: 14,
    fontWeight: "500",
    margin: 5,
    marginTop: 0,
  },
  modalAddButton: {
    backgroundColor: "#00693E",
    borderRadius: 20,
    justifyContent: "center",
    marginBottom: 4,
  },
  modalAddText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    padding: 10,
  },
  modalExit: {
    position: "absolute",
    top: 20,
    left: -20,
  },
  modalExitText: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },
  selectList: {
    width: "100%",
    backgroundColor: "transparent",
    marginTop: 0,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#00693E",
  },
  timeColon: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },
});
