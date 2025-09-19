import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert, TextInput, Keyboard, Vibration } from "react-native";

export default function Stopwatch() {
  const [timeElapsed, setTimeElapsed] = useState(0); // in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdownTarget, setCountdownTarget] = useState(null); // in ms
  const [inputSeconds, setInputSeconds] = useState(""); // for user input
  const intervalRef = useRef(null);
  const alertShownRef = useRef(false); // prevent multiple alerts

  // ⏰ Update current time every second
  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  // Format into HH:MM:SS:MS
  function getTimeString(ms) {
    if (ms < 0) ms = 0;
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    let milliseconds = Math.floor((ms % 1000) / 10); // 2-digit ms

    let formattedHours = hours.toString().padStart(2, "0");
    let formattedMinutes = minutes.toString().padStart(2, "0");
    let formattedSeconds = seconds.toString().padStart(2, "0");
    let formattedMs = milliseconds.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMs}`;
  }

  // Start Stopwatch or Countdown
  function startTimer() {
    if (!isRunning) {
      setIsRunning(true);
      const startTime = Date.now() - timeElapsed;

      intervalRef.current = setInterval(() => {
        if (countdownTarget) {
          setTimeElapsed((prev) => {
            const newTime = prev + 10;

            if (newTime >= countdownTarget) {
              clearInterval(intervalRef.current);
              setIsRunning(false);

              if (!alertShownRef.current) {
                alertShownRef.current = true;
                Alert.alert("⏰ Time's Up!", "Your countdown has finished.");
              }

              return countdownTarget;
            }
            return newTime;
          });
        } else {
          setTimeElapsed(Date.now() - startTime);
        }
      }, 10); // update every 10ms
    }
  }

  function pauseTimer() {
    if (isRunning) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
    }
  }

  function resetTimer() {
    pauseTimer();
    setTimeElapsed(0);
    setCountdownTarget(null);
    alertShownRef.current = false; // reset alert flag
  }

  function setTimer() {
    const seconds = parseInt(inputSeconds, 10);

    // Hide the keyboard immediately
    Keyboard.dismiss();
    if (!isNaN(seconds) && seconds > 0) {
      setCountdownTarget(seconds * 1000);
      setTimeElapsed(0);
      setInputSeconds("");
      alertShownRef.current = false; // reset alert for new timer
    } else {
      Alert.alert("⚠️ Please enter a valid number of seconds!");
    }
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <View style={styles.container}>
      {/* 🕒 Current Time */}
      <Text style={styles.clockText}>{currentTime.toLocaleTimeString()}</Text>

      {/* ⏱ Stopwatch / Timer */}
      <Text style={styles.timerText}>
        {getTimeString(countdownTarget ? countdownTarget - timeElapsed : timeElapsed)}
      </Text>

      {/* Input for countdown */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Seconds"
          placeholderTextColor="#aaa"
          value={inputSeconds}
          onChangeText={setInputSeconds}
          editable={!isRunning}
        />
        <Pressable
  style={[
    styles.btn,
    styles.set,
    isRunning ? styles.disabledBtn : null  // apply disabled style
  ]}
  onPress={setTimer}
  disabled={isRunning} // ← disable the button while running
>
  <Text style={styles.btnText}>Set Timer</Text>
</Pressable>

      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Pressable style={[styles.btn, styles.start]} onPress={startTimer}>
          <Text style={styles.btnText}>Start</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.pause]} onPress={pauseTimer}>
          <Text style={styles.btnText}>Pause</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.reset]} onPress={resetTimer}>
          <Text style={styles.btnText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0d1117",
    padding: 20,
  },
  clockText: {
    fontSize: 22,
    color: "#58a6ff",
    marginBottom: 40,
    fontWeight: "600",
  },
  timerText: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#f0f6fc",
    marginBottom: 30,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    padding: 10,
    width: 100,
    textAlign: "center",
    color: "#fff",
    backgroundColor: "#161b22",
    fontSize: 18,
  },
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  disabledBtn: {
  backgroundColor: "#555", // gray out button
  opacity: 0.6,            // make it look disabled
},

  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    margin: 6,
    elevation: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  start: {
    backgroundColor: "#2ea043",
  },
  pause: {
    backgroundColor: "#d29922",
  },
  reset: {
    backgroundColor: "#f85149",
  },
  set: {
    backgroundColor: "#8250df",
  },
});
