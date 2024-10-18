// Adapted: https://github.com/Bria222/React-Redux-Toolkit-Login-Register/tree/development

import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text } from "react-native-paper";
import Background from "../../components/Background";
import Logo from "../../components/Logo";
import Header from "../../components/Header";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import BackButton from "../../components/BackButton";
import { theme } from "../../core/theme";
import { emailValidator, emailValidatorSignup } from "../../helpers/emailValidator";
import { passwordValidator } from "../../helpers/passwordValidator";
import { userSignIn } from '../../features/auth/authActions.js'
import { signUpUser, fetchUser } from "../../actions/server.js";
import { useDispatch } from "react-redux";
import { useUpdateUserId } from '../../PusherContext.js'



export default function RegisterScreen({ navigation }) {
  // const [name, setName] = useState({ value: '', error: '' })
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [password2, setPassword2] = useState({ value: "", error: "" });
  const dispatch = useDispatch();
  const updateUserId = useUpdateUserId();

  const onSignUpPressed = async () => {
    // validate email: currently checks that it is not empty, 
    // has a ___@___.___ format, and is not in use
    // const emailError = emailValidator(email.value);
    let emailError;
    await emailValidatorSignup(email.value).then((res) => {
      emailError = res
    }
    )
    // Checks that password is not empty or less than 5 characters
    const passwordError = passwordValidator(password.value);
    const password2Error = passwordValidator(password2.value);
    if (emailError || passwordError || password2Error || password.value != password2.value) {
      // set the error messages to be displayed
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      setPassword2({ ...password2, error: password2Error });
      // check if passwords are equal
      if (password.value != password2.value) {
        setPassword2({ ...password2, error: "Your passwords must match" })
      }
    } else {

      const submitUserInfo = async (id) => {
        const userInfo = await fetchUser(id, dispatch);
        return userInfo;
      };

      signUpUser(email.value, password.value)
        .then((resp) => {
          // sign in and update redux
          dispatch(userSignIn({email: email.value, password: password.value}))
          .then((userData) => {
            if (userData.error) {
              // Give an alert
              Alert.alert('Login Error', "Invalid email or password");
            } else {
              // Otherwise update data as planned and navigate to home
              // console.log('USER ON LOGIN', userData.payload.user._id)
              updateUserId(userData.payload.user._id);
              submitUserInfo(userData.payload.user._id);
              // console.log(userData.payload.user.firstName, userData.payload.user.lastName)
              // Navigate to dummy profile screen to setup security questions
              navigation.navigate('NewUserScreen')
            } // Catch any other errors
          })
          .catch((error) => {
            Alert.alert("Login Error", "An unexpected error occurred. Please try again.");
          }); 
          // also catch any unexpected errors
        })
        .catch((error) => {
          Alert.alert("Sign Up Error", "An unexpected error occurred. Please try again.");
        });
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Create Account</Header>
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
        returnKeyType="next"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: "" })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <TextInput
        label="Confirm password"
        returnKeyType="done"
        value={password2.value}
        onChangeText={(text) => setPassword2({ value: text, error: '' })}
        error={!!password2.error}
        errorText={password2.error}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={onSignUpPressed}
        style={{ marginTop: 24 }}
      >
        Sign Up
      </Button>
      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});

/* <TextInput
        label="Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text) => setName({ value: text, error: '' })}
        error={!!name.error}
        errorText={name.error}
      />  */
