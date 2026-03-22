# Gemini Stream Chat
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 6.2](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-3%20flash%20preview-orange?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

Gemini Stream Chat is a modern, responsive chat application that leverages Google's Generative AI (Gemini) to provide real-time, streaming conversational experiences. Built with React and Vite, it offers a seamless interface for interacting with AI, managing conversation history, and monitoring token usage.

## Features

-   **Streaming AI Responses**: Experience real-time text generation with a typing effect.
-   **Conversation History**: Automatically saves and organizes your chat history locally.
-   **Token Counting**: Real-time estimation of prompt tokens to help manage usage.
-   **Responsive Design**: A clean, modern UI built with Tailwind CSS that works on desktop and mobile.
-   **Markdown Support**: Renders AI responses with proper formatting for code blocks, lists, and more.

## Tech Stack

-   **Frontend**: React 19, Vite, TypeScript
-   **Styling**: Tailwind CSS
-   **AI Integration**: Google Generative AI SDK (`@google/genai`)
-   **Icons**: Lucide React

## Prerequisites

-   [Node.js](https://nodejs.org/) (Latest LTS version recommended)
-   A Google Cloud Project with the Gemini API enabled and an API key.

## Installation

1.  **Clone the repository** (if applicable) or download the source code.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Configuration

1.  **Set up your environment variables**:
    -   Create a `.env` file in the root directory.
    -   Add your Gemini API key:
        ```env
        GEMINI_API_KEY=your_api_key_here
        ```

## Running the App

1.  **Start the development server**:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

## Project Structure

-   `src/components`: Reusable UI components (ChatWindow, MessageInput, Sidebar).
-   `src/services`: API service functions (Gemini integration).
-   `src/types`: TypeScript type definitions.
-   `src/App.tsx`: Main application component managing state and layout.

## Building for Production

To create a production build:

```bash
npm run build
```

This will generate the static files in the `dist` directory.
