import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextCoreWebVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react/display-name": "off",
      "@next/next/no-img-element": "off",
      "jsx-a11y/alt-text": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default config;
