# Project Overview

This directory contains a React application that functions as a Sankey Diagram Generator. It allows users to input CSV data (either by uploading a file or pasting text) and visualizes it as a Sankey diagram. Users can customize various diagram settings such as font size, node padding, diagram dimensions, color scheme, and gradient display. The application also provides a feature to download the generated Sankey diagram as a PNG image.

**Key Technologies:**
*   **Frontend:** React.js
*   **Data Visualization:** D3.js (`d3`, `d3-sankey`)
*   **CSV Parsing:** PapaParse
*   **Testing:** `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
*   **Web Vitals:** `web-vitals`

# Building and Running

This project is a Create React App. The following commands are available:

*   **`npm start`**: Runs the app in development mode.
*   **`npm run build`**: Builds the app for production to the `build` folder.
*   **`npm test`**: Launches the test runner in the interactive watch mode.
*   **`npm run eject`**: Removes the single build dependency from your project. (Use with caution, as this is a one-way operation).
*   **`npm run predeploy`**: Runs the build script before deployment.
*   **`npm run deploy`**: Deploys the built application to GitHub Pages.

# Development Conventions

Based on the provided source code and `package.json`:

*   **Component Structure:** The application is structured into functional React components (`App.js`, `SankeyDiagram.js`).
*   **State Management:** React Hooks (`useState`, `useRef`) are used for managing component state and accessing DOM elements.
*   **Side Effects:** The `useEffect` hook is utilized for handling side effects, such as drawing the Sankey diagram when data or settings change.
*   **Imperative Handles:** `useImperativeHandle` and `forwardRef` are used in `SankeyDiagram.js` to expose an `exportPng` method to the parent `App` component, allowing for direct interaction with the diagram's functionality.
*   **Styling:** CSS modules (`App.css`, `index.css`) are used for styling components.
*   **Testing:** The project uses `@testing-library/react` and `jest-dom` for testing, as configured in `package.json` and `setupTests.js`.
*   **Utility Libraries:** `d3`, `d3-sankey`, and `papaparse` are external libraries used for specific functionalities.
*   **Code Formatting/Linting:** The `eslintConfig` in `package.json` indicates that the project extends `react-app` and `react-app/jest` configurations for ESLint.
*   **Browser Compatibility:** The `browserslist` configuration specifies browser compatibility targets for production and development builds.