export default {
  ignore: {
    overrides: [
      {
        // Four creators and five streams are fixed playground samples.
        files: ["**/playground-intelligence.tsx"],
        rules: ["react-doctor/js-set-map-lookups"],
      },
      {
        // Keep independent examples of public popover composition in both harnesses.
        files: [
          "**/playground-component-overlays.tsx",
          "**/qualification-page.tsx",
        ],
        rules: ["react-doctor/duplicate-jsx-subtree"],
      },
    ],
  },
}
