import { REQUEST_TIMEOUT } from "../constants";
import { Password } from "../models";

/**
 * Validates a password.
 *
 * @param password - An object containing the password and its confirmation.
 * @returns A boolean indicating whether the password is valid or not.
 */
export function validatePassword(password: Password): boolean {
  // Check if password length is at least 8 characters
  // and matches the confirmation password.
  if (password.password.length >= 8 && password.password === password.confirm) {
    return true;
  }
  // If conditions are not met, return false.
  return false;
}

/**
 * Wraps a promise with a timeout functionality.
 *
 * @param promise - The original promise to be wrapped.
 * @param timeout - The time in milliseconds to wait before timing out.
 *                  Default is REQUEST_TIMEOUT.
 * @returns A new Promise that will reject if the original promise takes too long.
 */
export function promisifyWithTimeout<T>(promise: Promise<T>, timeout: number = REQUEST_TIMEOUT): Promise<T> {
  return new Promise((resolve, reject) => {
    // Set a timer that will reject the promise after the timeout period.
    const timer = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, timeout);

    // Handle promise resolution and rejection.
    promise.then(
      (res) => {
        // Clear the timeout timer upon successful resolution.
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        // Clear the timeout timer upon rejection.
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}
