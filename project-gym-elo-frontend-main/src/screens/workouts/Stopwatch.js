import React, { useState, useEffect } from "react";
import { Text, SafeAreaView, StyleSheet } from "react-native";

// Stopwatch code gotten from https://www.geeksforgeeks.org/create-a-stop-watch-using-react-native/
// time formatting gotten from stack overflow https://stackoverflow.com/questions/37096367/how-to-convert-seconds-to-minutes-and-hours-in-javascript

const Stopwatch = ({ running, startTimeRef }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, startTimeRef]);

  return (
    <SafeAreaView style={styles.timerView}>
      <Text style={styles.timer}>
        {Math.floor(time / 3600)
          .toString()
          .padStart(2, "0")}
        :
        {Math.floor((time % 3600) / 60)
          .toString()
          .padStart(2, "0")}
        :
        {Math.floor(time % 60)
          .toString()
          .padStart(2, "0")}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  timerView: {
    verticalAlign: "middle",
    alignSelf: "center",
    backgroundColor: "white",
    marginBottom: 20,
    borderColor: "black",
    borderWidth: 3,
    height: 30,
    width: "40%",
    borderRadius: 20,
  },
  timer: {
    alignSelf: "center",
    color: "black",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    paddingHorizontal: 20,
  },
});

export default Stopwatch;
