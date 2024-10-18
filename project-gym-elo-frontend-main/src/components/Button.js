// https://github.com/venits/react-native-login-template/tree/master

import React from 'react'
import { StyleSheet } from 'react-native'
import { Button as PaperButton } from 'react-native-paper'
import { theme } from '../core/theme'

export default function Button({ mode, style, ...props }) {
  return (
    <PaperButton
      style={[
        styles.button,
        mode === 'outlined' && { backgroundColor: theme.colors.surface },
        mode !== 'outlined' && { backgroundColor: '#00693E' },
        style,
      ]}
      labelStyle={[styles.text, mode === 'outlined' && { color: '#00693E' }]}
      mode={mode}
      theme={{colors: {primary: '#00693E'}}}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginVertical: 10,
    paddingVertical: 2,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 26,
  },
})
