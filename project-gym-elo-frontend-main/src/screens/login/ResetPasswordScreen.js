// Adapted: https://github.com/Bria222/React-Redux-Toolkit-Login-Register/tree/development

import React, { useState } from 'react'
import Background from '../../components/Background'
import BackButton from '../../components/BackButton'
import Header from '../../components/Header'
import TextInput from '../../components/TextInput'
import Button from '../../components/Button'
import { emailValidatorSignin } from '../../helpers/emailValidator'
import { passwordValidator } from '../../helpers/passwordValidator'
import { securityValidator } from '../../helpers/securityValidator'
import { StyleSheet, Text, SafeAreaView, Alert } from 'react-native'
import { resetPassword } from '../../actions/server'


export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' })
  const [maiden, setMaiden] = useState({ value: '', error: '' })
  const [teacher, setTeacher] = useState({ value: '', error: '' })
  const [newPassword, setNewPassword] = useState({ value: '', error: '' })
  const [newPassword2, setNewPassword2] = useState({ value: '', error: '' })

  const handleResetPassword = () => {
    const maidenError = securityValidator(maiden.value)
    const teacherError = securityValidator(teacher.value)
    const emailError = emailValidatorSignin(email.value)
    const newPasswordError = passwordValidator(newPassword.value)
    if (emailError || newPasswordError || maidenError || teacherError || newPassword.value != newPassword2.value) {
      setEmail({ ...email, error: emailError })
      setMaiden({ ...maiden, error: maidenError })
      setTeacher({ ...teacher, error: teacherError })
      setNewPassword({ ...newPassword, error: newPasswordError })
      if (newPassword.value != newPassword2.value) {
        setNewPassword2({ ...newPassword2, error: "Your passwords must match" })
      }
      return
    }
    const input = { userEmail: email.value, maiden: maiden.value, 
      teacher: teacher.value, newPassword: newPassword.value }
    resetPassword(input).then((response) => {
      if (response.data.user) {
        // update data as planned and navigate to home
        Alert.alert("Successfully reset password")
        navigation.navigate('LoginScreen')
        return
      } 
      else {
        // Otherwise // set new error
        setMaiden({ ...maiden, error: response.data.error })
        setTeacher({ ...teacher, error: response.data.error })
        return
      } // Catch any other errors
    })
    return
  }

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Header>Restore Password</Header>
      <TextInput
        label="E-mail address"
        returnKeyType="done"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Maiden name"
        returnKeyType="done"
        value={maiden.value}
        onChangeText={(text) => setMaiden({ value: text, error: '' })}
        error={!!maiden.error}
        errorText={maiden.error}
        autoCapitalize="none"
        header="What is your mother's maiden name?"
      />
      <TextInput
        label="Teacher's name"
        returnKeyType="done"
        value={teacher.value}
        onChangeText={(text) => setTeacher({ value: text, error: '' })}
        error={!!teacher.error}
        errorText={teacher.error}
        autoCapitalize="none"
        header="What is the name of your favorite teacher?"
      />
      <TextInput
        label="New password"
        returnKeyType="done"
        value={newPassword.value}
        onChangeText={(text) => setNewPassword({ value: text, error: '' })}
        error={!!newPassword.error}
        errorText={newPassword.error}
        secureTextEntry
        header="Create your new password"
      />
      <TextInput
        label="Confirm new password"
        returnKeyType="done"
        value={newPassword2.value}
        onChangeText={(text) => setNewPassword2({ value: text, error: '' })}
        error={!!newPassword2.error}
        errorText={newPassword2.error}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={handleResetPassword}
        style={{ marginTop: 16 }}
      >
        Reset Password
      </Button>
    </Background>
  )
}


// const styles = StyleSheet.create({
//   view: {
// 		flexDirection: "row",
// 		margin: 15,
// 		paddingTop: 20,
// 	},
//   questions: {
//     fontSize: 15,
//     lineHeight: 21,
//     textAlign: 'start',
//     marginBottom: 2,
//   },
// })