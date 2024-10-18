// Adapted: https://github.com/Bria222/React-Redux-Toolkit-Login-Register/tree/development

import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View, Alert } from "react-native";
import { Text } from "react-native-paper";
import Background from "../../components/Background";
import Logo from "../../components/Logo";
import Header from "../../components/Header";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import BackButton from "../../components/BackButton";
import { theme } from "../../core/theme";
import { emailValidatorSignin } from "../../helpers/emailValidator";
import { passwordValidator } from "../../helpers/passwordValidator";
import { userSignIn } from "../../features/auth/authActions.js";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUpdateUserId } from "../../PusherContext.js";
import { createUser } from "../../features/users/userSlice";
import { resetPassword, fetchUser } from "../../actions/server";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const dispatch = useDispatch();
  const updateUserId = useUpdateUserId();

  const onLoginPressed = async () => {
    let emailError;
    await emailValidatorSignin(email.value).then((res) => {
      emailError = res
    }
    )
    const passwordError = passwordValidator(password.value);
    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }
    const data = { email: email.value, password: password.value };

    const submitUserInfo = async (id) => {
      const userInfo = await fetchUser(id, dispatch);
      return userInfo;
    };
    // console.log(data)
    // Logic to catch for incorrect password or email
    // Check for incorrect user data
    dispatch(userSignIn(data))
      .then((userData) => {
        if (userData.error) {
          // Give an alert
          Alert.alert("Login Error", "Invalid email or password");
        } else {
          // Otherwise update data as planned and navigate to home
          // console.log('USER ON LOGIN', userData.payload.user._id)
          updateUserId(userData.payload.user._id);
          submitUserInfo(userData.payload.user._id);
          // console.log(userData.payload.user.firstName, userData.payload.user.lastName)
          // Send users to the settings page to configure their name if none
          if (
            !userData.payload.user.firstName ||
            !userData.payload.user.lastName
          ) {
            navigation.navigate("Settings");
          } else {
            navigation.navigate("Main");
          }
        } // Catch any other errors
      })
      .catch((error) => {
        Alert.alert(
          "Login Error",
          "An unexpected error occurred. Please try again."
        );
      });
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome back.</Header>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: "" })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: "" })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ResetPasswordScreen")}
        >
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={onLoginPressed}>
        Login
      </Button>
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace("RegisterScreen")}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
