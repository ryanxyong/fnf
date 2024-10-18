import { getUserByEmail } from '../actions/server.js'

export function emailValidator(email) {
  const re = /\S+@\S+\.\S+/
  if (!email) return "Email can't be empty."
  if (!re.test(email)) return 'Ooops! We need a valid email address.'
  return ''
}

export async function emailValidatorSignin(email) {
  let emailError = ''
  const re = /\S+@\S+\.\S+/
  if (!email) return "Email can't be empty."
  if (!re.test(email)) return 'Ooops! We need a valid email address.'
  await getUserByEmail(email).then((result) => {
    if (!result) {
      emailError = "There is no account associated with this email"
    }
  });
  return emailError
}

export async function emailValidatorSignup(email) {
  let emailError = ''
  const re = /\S+@\S+\.\S+/
  if (!email) return "Email can't be empty."
  if (!re.test(email)) return 'Ooops! We need a valid email address.'
  await getUserByEmail(email).then((result) => {
    if (result) {
      emailError = "This email is already in use"
    }
  });
  return emailError
}
