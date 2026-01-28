<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# K-Motion Studio

A React-based AI Studio application.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation

1.  Clone the repository (if applicable)
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally

1.  Set the `GEMINI_API_KEY` in `.env.local`:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```
    *(Note: Ensure your environment variable starts with `VITE_` if used in client-side code)*

2.  Start the development server:
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Building for Production

To create a production build:

```bash
npm run build
```

The artifacts will be stored in the `dist` directory.

## Deployment

This project includes a GitHub Action for automatic deployment to GitHub Pages.

### Setup

1.  Go to your GitHub repository settings.
2.  Navigate to **Pages**.
3.  Under **Build and deployment**, select **GitHub Actions** as the source.
4.  Push changes to the `main` branch to trigger the deployment automatically.

## Project Structure

- `src/`: Source code
- `.github/workflows/`: GitHub Actions configurations
- `public/`: Static assets

