const offline: boolean = true;

export const baseAddress = offline
  ? "http://localhost:4444"
  : "https://peter-quiz-app.azurewebsites.net";
