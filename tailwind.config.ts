import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      main: {
        100: "#E3E7EE",
        200: "#C8CFDC",
        300: "#AEB7CA",
        400: "#939FB8",
        500: "#1D3557",
        600: "#152844", // Darker shade for hover states
      },
      secondary: {
        100: "#FDDCDC",
        200: "#FCAAAA",
        300: "#FA7777",
        400: "#F94545",
        500: "#E63946",
      },
      steelBlue: {
        100: "#E5EFF5",
        200: "#C9DEE9",
        300: "#A6CDDF",
        400: "#82BCD4",
        500: "#457B9D",
      },
      teal: {
        100: "#ECF9F8",
        200: "#D8F3F1",
        300: "#C3EEEA",
        400: "#AFE8E3",
        500: "#A8DADB",
      },
      ivory: {
        100: "#F6FCF3",
        200: "#EDF9E8",
        300: "#E3F5DC",
        400: "#DAF2D1",
        500: "#F1FAEE",
      },
      white: "#ffffff",
      black: "#000000",
      transparent: "transparent",
      success: "#198754",
      error: "#dc3545",
      warning: "#ffc107",
      info: "#0dcaf0",
      orange: "#ffa007",
      gray: {
        50: "#F9FAFB",
        100: "#F4F4F6",
        200: "#E5E6EB",
        300: "#D3D5DA",
        400: "#9EA3AE",
        500: "#6C727F",
        600: "#4D5461",
        700: "#394150",
        800: "#212936",
        900: "#0B0A0F",
      },
      green: "#5A9F0B",
      "main-blue": "#100A55",
      red: "#EE6A5F",
      bg: "#F5FBFC",
      // Shadcn colors
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      chart: {
        "1": "hsl(var(--chart-1))",
        "2": "hsl(var(--chart-2))",
        "3": "hsl(var(--chart-3))",
        "4": "hsl(var(--chart-4))",
        "5": "hsl(var(--chart-5))",
      },
      sidebar: {
        DEFAULT: "hsl(var(--sidebar))",
        foreground: "hsl(var(--sidebar-foreground))",
        primary: "hsl(var(--sidebar-primary))",
        "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
        accent: "hsl(var(--sidebar-accent))",
        "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
        border: "hsl(var(--sidebar-border))",
        ring: "hsl(var(--sidebar-ring))",
      },
    },
    fontFamily: {
      sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      mono: ["monospace"],
    },
    fontSize: {
      xs: [".75rem", "1rem"],
      sm: [".875rem", "1.225rem"],
      base: ["1rem", "1.5rem"],
      "base-tall": ["1rem", "1.6rem"],
      lg: ["1.125rem", "1.75rem"],
      xl: ["1.25rem", "1.75rem"],
      "xl-tall": ["1.25rem", "2rem"],
      "2xl": ["1.5rem", "2rem"],
      "3xl": ["2rem", "2.25rem"],
      "4xl": ["2.5rem", "1"],
      "5xl": ["4rem", "1"],
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
      extrabold: 800,
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
      },
    },
    extend: {
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
      zIndex: {
        999: "999",
        1: "1",
        2: "2",
      },
      keyframes: {
        leftRight: {
          "0%": { left: "-285px" },
          "100%": { left: "0px" },
        },
        rightLeft: {
          "0%": { right: "-290" },
          "100%": { right: "0px" },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        swap: "leftRight 0.5s ease-in-out 1",
        swapRight: "rightLeft 0.5s ease-in-out 1",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        "slider-bg": "url('../assets/slider/background.png')",
        "sliderLeft-bg": "url('../assets/slider/slider1.png')",
        service: "url('../assets/service/service.png')",
        vedioImg: "url('../assets/images/video.png')",
        PropertyDefult: "url('../assets/properties/property-1.png')",
        paySuccess: "url('../assets/messages/base.png')",
        mailBox: "url('../assets/messages/mailbox.png')",
        successMessage: "url('../assets/messages/success2.png')",
        caravan: "url('../assets/caravan.png')",
        balance: "url('../assets/images/balance-bg.png')",
        points: "url('../assets/images/points-bg.png')",
      },
      borderWidth: {
        3: "3px",
      },
      spacing: {
        695: "695px",
        52: "52%",
      },
      letterSpacing: {
        tightest: "-.075em",
      },
      boxShadow: {
        basic: "0px 3px 40px rgba(14, 8, 84, 0.05)",
        basicSm: "0px 4px 40px rgba(14, 8, 84, 0.1);",
        basicMd: "0px 4px 20px rgba(14, 8, 84, 0.08);",
        smoothGray: "0px -3px 48px 12px rgba(207, 207, 207, 0.21);",
      },
      dropShadow: {
        basic: " 0px 4px 40px rgba(14, 8, 84, 0.1)",
        "basic-sm": "0px 0px 64px rgba(0, 0, 0, 0.13)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
