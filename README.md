# Blaze Website

This is a Node.js HTTP server for the Blaze Website.

## Setup Instructions

1. Make sure you have Node.js installed on your computer. You can download it from [nodejs.org](https://nodejs.org/).

2. Open a terminal/command prompt and navigate to the project directory:
   ```
   cd "c:\Users\yashw\Desktop\Html\Blaze website (3)\Blaze website"
   ```

3. Install the required dependencies:
   ```
   npm install
   ```

4. Start the server:
   ```
   npm start
   ```

5. Open your web browser and go to:
   ```
   http://localhost:3000
   ```

## Mobile Access Instructions

To access the website on your mobile device:

1. Make sure your computer and mobile device are connected to the same WiFi network.

2. Start the server with mobile access enabled:
   ```
   npm run mobile
   ```

3. The terminal will display your computer's local IP address. It will look something like:
   ```
   To access from other devices on your network, use: http://192.168.1.X:3006
   ```

4. On your mobile device, open a web browser and enter the URL displayed in the terminal.

5. You should now be able to access and interact with the Blaze website on your mobile device.

## Features

- Serves all static files (HTML, CSS, JavaScript, images)
- Simple and lightweight
- Easy to use

## Secure Access (HTTPS)

For testing features that require HTTPS:

1. Start the secure server:
   ```
   npm run start:secure
   ```

2. This will start both HTTP and HTTPS servers. The HTTPS server will be available at:
   ```
   https://localhost:3007
   ```
   
3. For mobile access with HTTPS, use the network URL displayed in the terminal.

## Development Mode

For development with automatic server restarts:

```
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Stopping the Server

To stop the server, press `Ctrl+C` in the terminal/command prompt where the server is running.
