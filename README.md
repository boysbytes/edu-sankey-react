# Sankey Diagram Generator

This is a React application that allows users to generate Sankey diagrams from CSV data. Users can upload a CSV file or paste CSV content directly, customize diagram settings (font size, node padding, dimensions, color scheme, gradient), and download the generated diagram as a PNG image.

## Technologies Used

*   **Frontend:** React.js
*   **Data Visualization:** D3.js (`d3`, `d3-sankey`)
*   **CSV Parsing:** PapaParse

## Getting Started

To run this project locally, you need Node.js and npm (or yarn) installed.

1.  **Install Dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

2.  **Run the Application in Development Mode:**
    ```bash
    npm start
    # or yarn start
    ```
    The application will open in your browser at `http://localhost:3000` (or another available port).

## Building for Production

To create a production-ready build of the application:

```bash
npm run build
# or yarn build
```

This will create a `build` folder containing the optimized production assets.

## Deployment

This project is configured for deployment to GitHub Pages using `gh-pages`.

To deploy:

```bash
npm run deploy
# or yarn deploy
```
