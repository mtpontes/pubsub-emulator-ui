# PubSub Emulator UI

A web interface to interact with the Google Cloud Pub/Sub Emulator. This tool allows you to easily manage topics and subscriptions, publish messages, and view received messages in a local environment.

## Features

- **Topics & Subscriptions**: View and manage your Pub/Sub topics and subscriptions.
- **Publisher**: Publish messages to specific topics with custom data and attributes.
- **Subscriber**: View messages received by subscriptions in real-time.
- **Docker Support**: Easily deployable alongside the Pub/Sub emulator using Docker Compose.

## How to Run

### Using Docker Compose (Recommended)

1. Ensure you have Docker and Docker Compose installed.
2. Run the services:
   ```bash
   docker-compose up -d
   ```
3. Access the UI at `http://localhost:5173`.
4. The Pub/Sub Emulator will be available at `localhost:10001`.

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Technologies

- React
- TypeScript
- Vite
- Framer Motion
- Lucide React
- Google Cloud Pub/Sub Emulator
