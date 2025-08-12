import { defineStyleConfig, extendTheme } from "@chakra-ui/react";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";

const Button = defineStyleConfig({
  variants: {
    primary: {
      color: "white",
      bg: "primary",
      _hover: {
        bg: "blue.600",
      },
      _active: {
        bg: "blue.800",
      },
    },
    gradient: {
      color: "white",
      colorScheme: "blue",
      bgGradient: "linear(to-r, #79D8FF, #284AFF)",
      transition: "all ease 0.5s",
      _hover: {
        bgGradient: "linear(to-r, #61abc9, #1f39c4)",
      },
      _active: {
        bgGradient: "linear(to-r, #1f39c4, #192c91)",
      },
      _loading: {
        bg: "#192c91 !important",
      },
    },
  },
  baseStyle: {
    // _focus: {
    //   boxShadow: "0 0 1px 2px #3b82f640",
    // },
  },
  defaultProps: {
    size: "md",
  },
});

const colorBlue = {
  50: "#eff6ff",
  100: "#dbeafe",
  200: "#bfdbfe",
  300: "#93c5fd",
  400: "#60a5fa",
  500: "#3b82f6",
  600: "#2563eb",
  700: "#1d4ed8",
  800: "#1e40af",
  900: "#1e3a8a",
  950: "#172554",
};

const colorGray = {
  50: "#F9FBFB",
  200: "#DDE7ED",
  500: "#819AB0",
  800: "#546279",
  900: "#465162",
};

const theme = extendTheme({
  initialColorMode: "light",
  useSystemColorMode: false,
  fonts: {
    heading: "Geist, system-ui, sans-serif",
    body: "Geist, system-ui, sans-serif",
    mono: "Geist Mono, Menlo, monospace",
  },
  colors: {
    secondary: "#c2ddff",
    text: "#546279",
    text_dark: "whiteAlpha.900",
    bg_gradient: "linear-gradient(90deg, #ffffff 0%, #c5e0ff 100%);",
    bg_gradient_dark: "linear-gradient(90deg, #1f2c3b 0%, #090b13 100%);",
    blue: colorBlue,
    gray: colorGray,
  },
  semanticTokens: {
    colors: {
      primary: {
        default: "#203BE2",
        _dark: "#ffffff",
      },
    },
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        fontFamily: "body",
        color: mode("text", "text_dark")(props),
        // bg: mode("bg_gradient", "bg_gradient_dark")(props),
        bg: "#EEF2FD",
        lineHeight: "base",
      },
      "::-webkit-scrollbar": {
        // w: "0",
        display: "none",
        // bgColor: "#DDE7ED",
      },
      // "::-webkit-scrollbar-thumb": {
      //   bgColor: "blue.900",
      //   borderRadius: "8px",
      // },
      "*": {
        scrollbarColor: "blue.900",
        // scrollbarColor: "transparent",
      },
    }),
  },
  components: {
    Button,
  },
});

export { theme };
