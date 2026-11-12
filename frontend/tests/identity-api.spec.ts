import { expect, test } from "@playwright/test"
import { retryAfterSeconds, waitPhrase } from "../src/identity/api"

test("Retry-After is read as delta-seconds or an HTTP date", () => {
  const now = Date.parse("2026-11-12T12:00:00Z")
  expect(retryAfterSeconds("120", now)).toBe(120)
  expect(retryAfterSeconds("Thu, 12 Nov 2026 12:05:00 GMT", now)).toBe(300)
  expect(retryAfterSeconds("Thu, 12 Nov 2026 11:00:00 GMT", now)).toBeUndefined()
  expect(retryAfterSeconds("soon", now)).toBeUndefined()
  expect(retryAfterSeconds(null, now)).toBeUndefined()
})

test("the wait reads in seconds under a minute and whole minutes above", () => {
  expect(waitPhrase(1)).toBe("in 1 second")
  expect(waitPhrase(45)).toBe("in 45 seconds")
  expect(waitPhrase(61)).toBe("in 2 minutes")
  expect(waitPhrase(300)).toBe("in 5 minutes")
})
