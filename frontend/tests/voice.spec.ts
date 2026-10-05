import { expect, test } from "@playwright/test"

async function denyCapture(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const calls = { capture: 0, devices: 0, recognition: 0, recording: 0 }
    Object.assign(window, { __captureCalls: calls })
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: () => {
          calls.capture++
          return Promise.reject(new Error("Capture forbidden in fixture lab"))
        },
        enumerateDevices: () => {
          calls.devices++
          return Promise.resolve([])
        },
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    })
    Object.assign(window, {
      SpeechRecognition: class {
        constructor() {
          calls.recognition++
        }
      },
      MediaRecorder: class {
        constructor() {
          calls.recording++
        }
      },
    })
  })
}
test("voice capture appearances are controlled and never request devices or services", async ({
  page,
}, info) => {
  await denyCapture(page)
  const writes: string[] = [],
    external: string[] = []
  page.on("request", (r) => {
    if (!["GET", "HEAD"].includes(r.method())) writes.push(r.url())
    if (!r.url().startsWith("http://127.0.0.1:18541") && !r.url().startsWith("data:"))
      external.push(r.url())
  })
  await page.goto("/?view=Voice&mode=light")
  await expect(page.getByRole("button", { name: "Microphone capture disabled" })).toBeDisabled()
  await page.getByLabel("Transient transcript note").fill("local review draft")
  await page.getByRole("button", { name: "Inspect transcript save intent" }).click()
  await expect(page.getByText(/Transcript save intent refused/)).toBeVisible()
  await page.getByLabel("Voice state").selectOption("recording")
  await expect(page.getByText(/Recording appearance only/)).toBeVisible()
  await expect(page.getByLabel("Transient transcript note")).toHaveValue("")
  await page.getByRole("button", { name: "Microphone capture disabled" }).dispatchEvent("click")
  await page.getByLabel("Voice state").selectOption("transcribing")
  await expect(page.getByText("No authored segments revealed.", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Reveal next authored segment" }).click()
  await expect(
    page.getByRole("button", {
      name: "Authored review text: inspect the bundled context.",
      exact: true,
    }),
  ).toBeVisible()
  await page.screenshot({
    path: info.outputPath("voice-transcribing-desktop.png"),
    animations: "disabled",
  })
  await page.getByLabel("Voice state").selectOption("permission-unavailable")
  await expect(page.getByText(/no device permission was requested/)).toBeVisible()
  await expect(page.getByLabel("Transient transcript note")).toBeDisabled()
  await page.getByLabel("Voice state").selectOption("unknown")
  await expect(page.getByText(/Unknown fixture voice status/)).toBeVisible()
  await page.getByLabel("Voice state").selectOption("denied")
  await expect(page.getByText(/Voice evidence denied/)).toBeVisible()
  await expect(page.getByLabel("Transient transcript note")).toHaveCount(0)
  await expect(page.locator("audio")).toHaveCount(0)
  expect(
    await page.evaluate(() => (window as unknown as { __captureCalls: unknown }).__captureCalls),
  ).toEqual({ capture: 0, devices: 0, recognition: 0, recording: 0 })
  expect(writes).toEqual([])
  expect(external).toEqual([])
})
test("actual local AudioPlayer keyboard playback seeks transcript and retires old media", async ({
  page,
}, info) => {
  await denyCapture(page)
  const requests: string[] = []
  page.on("request", (r) => requests.push(r.url()))
  await page.goto("/?view=Activity&mode=light")
  expect(requests.filter((r) => /\/Player-|media-chrome|\/media\//.test(r))).toEqual([])
  await page.getByRole("button", { name: "Voice", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Authored timed review text" })).toBeVisible()
  expect(requests.filter((r) => /\/Player-|media-chrome|\/media\//.test(r))).toEqual([])
  await page.getByRole("button", { name: "Audio", exact: true }).click()
  await expect
    .poll(() => page.locator("audio").evaluate((e) => (e as HTMLAudioElement).readyState))
    .toBeGreaterThan(0)
  await expect
    .poll(() => page.locator("audio").evaluate((e) => (e as HTMLAudioElement).duration))
    .toBe(8)
  expect(await page.locator("audio").evaluate((e) => (e as HTMLAudioElement).paused)).toBe(true)
  await page.locator("media-play-button").focus()
  await page.keyboard.press("Enter")
  await expect
    .poll(() => page.locator("audio").evaluate((e) => (e as HTMLAudioElement).paused))
    .toBe(false)
  await expect
    .poll(() => page.locator("audio").evaluate((e) => (e as HTMLAudioElement).currentTime))
    .toBeGreaterThan(0)
  await page.locator("media-play-button").click()
  const segment = page.getByRole("button", {
    name: "This timing accompanies a generated tone, not recognized speech.",
    exact: true,
  })
  await segment.focus()
  await page.keyboard.press("Enter")
  await expect
    .poll(() => page.locator("audio").evaluate((e) => (e as HTMLAudioElement).currentTime))
    .toBe(2)
  await expect(segment).toHaveAttribute("data-active", "true")
  await page.locator("media-mute-button").click()
  expect(await page.locator("audio").evaluate((e) => (e as HTMLAudioElement).muted)).toBe(true)
  expect((await page.locator("media-time-range").boundingBox())?.height).toBeGreaterThan(10)
  expect(
    await page
      .locator('[data-slot="audio-player"]')
      .evaluate((e) => getComputedStyle(e).getPropertyValue("--media-control-padding")),
  ).toBe("0px")
  await page.screenshot({
    path: info.outputPath("voice-audio-desktop.png"),
    animations: "disabled",
  })
  await page.evaluate(() => {
    Object.assign(window, { __oldVoiceAudio: document.querySelector("audio") })
  })
  await page.getByLabel("Transient transcript note").fill("retire this note")
  await page.getByRole("button", { name: /Choose review sample:/ }).click()
  await page.getByRole("option", { name: /Refused review tone/ }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByLabel("Transient transcript note")).toHaveValue("")
  await expect(page.locator("audio")).toHaveAttribute("src", "/media/review-tone-002.wav")
  await expect
    .poll(() => page.locator("audio").evaluate((e) => (e as HTMLAudioElement).duration))
    .toBe(10)
  await page.evaluate(() => {
    const old = (window as unknown as { __oldVoiceAudio: HTMLAudioElement }).__oldVoiceAudio
    old.dispatchEvent(new Event("timeupdate"))
    old.dispatchEvent(new Event("play"))
    if (!old.paused || old.getAttribute("src")) throw Error("Retired player retained media")
  })
  await expect(page.getByText(/Local audio paused \/ manual review position/)).toBeVisible()
  await page
    .getByRole("button", { name: "Inspect related run (full snapshot)", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("RUN-003")
  await page.keyboard.press("Escape")
  await page.getByLabel("Voice state").selectOption("error")
  await expect(page.locator("audio")).toHaveCount(0)
  await expect(page.getByText(/Scripted media error/)).toBeVisible()
  expect(
    requests.filter((r) => /^https?:\/\//.test(r) && !r.startsWith("http://127.0.0.1:18541")),
  ).toEqual([])
})
test("sample selector keyboard focus and timed transcript bounds share fixture graph", async ({
  page,
}) => {
  await page.goto("/?view=Voice&mode=light")
  const trigger = page.getByRole("button", { name: /Choose review sample:/ })
  await trigger.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("dialog", { name: "Choose bundled review sample" })).toBeVisible()
  await page.getByRole("combobox", { name: "Search review samples", exact: true }).fill("Refused")
  await page.getByRole("option", { name: /Refused review tone/ }).click()
  await expect(trigger).toBeFocused()
  await expect(
    page.getByText(/CHAT-003\/SESSION-003\/RUN-003\/TOOL-003\/SPAN-TOOL-003/),
  ).toBeVisible()
  for (let i = 0; i < 6; i++)
    await page.getByRole("button", { name: "Advance review position" }).click()
  await expect(page.getByText("10.00s / 10s", { exact: true })).toBeVisible()
  await expect(page.locator('[data-slot="transcription"] [data-active="true"]')).toHaveCount(0)
  await page.getByRole("button", { name: "Reset review position" }).click()
  await expect(
    page.getByRole("button", {
      name: "Authored review text: inspect the bundled context.",
      exact: true,
    }),
  ).toHaveAttribute("data-active", "true")
  await page.getByLabel("Voice state").selectOption("empty")
  await expect(page.getByText(/No voice samples or transcript segments/)).toBeVisible()
  const model = await import("../src/voice/model")
  expect(model.voiceModel("denied", "AUDIO-001", 0).segments).toEqual([])
})
test("narrow themed media controls and portable voice stories need no capture or API", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await denyCapture(page)
  await page.goto("/?view=Voice&theme=p3-amber-phosphor&mode=dark")
  await page.getByLabel("Voice state").selectOption("long-content")
  await page.getByRole("heading", { name: "Authored timed review text" }).scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("voice-transcript-narrow.png"),
    animations: "disabled",
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.getByLabel("Voice state").selectOption("normal")
  await page.getByRole("button", { name: "Audio", exact: true }).click()
  await page.getByLabel("Local sample player").scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("voice-audio-narrow.png"), animations: "disabled" })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  const api: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url())) api.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=voice-controlled-review--local-audio&viewMode=story",
  )
  await expect(page.locator("audio")).toHaveAttribute("src", "/media/review-tone-001.wav")
  await expect
    .poll(() => page.locator("audio").evaluate((e) => (e as HTMLAudioElement).duration))
    .toBe(8)
  expect(api).toEqual([])
})
