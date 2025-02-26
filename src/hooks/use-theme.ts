"use client"

import { useTheme as useNextTheme } from "next-themes"

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme()

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  return {
    theme: currentTheme,
    setTheme,
    toggleTheme,
    isDark: currentTheme === "dark",
  }
} 