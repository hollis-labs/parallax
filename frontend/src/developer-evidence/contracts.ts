import type {
  Commit,
  CommitFile,
  CommitFiles,
  StackTrace,
  StackTraceFrames,
  Test,
  TestError,
  TestResults,
  TestResultsProgress,
  TestSuite,
} from "@hollis-labs/kit-code"
import type { ComponentProps } from "react"

type NotAny<T> = 0 extends 1 & T ? false : true
type Assert<T extends true> = T
export type GenuineResults = Assert<NotAny<ComponentProps<typeof TestResults>>>
export type GenuineProgress = Assert<NotAny<ComponentProps<typeof TestResultsProgress>>>
export type GenuineSuite = Assert<NotAny<ComponentProps<typeof TestSuite>>>
export type GenuineTest = Assert<NotAny<ComponentProps<typeof Test>>>
export type GenuineError = Assert<NotAny<ComponentProps<typeof TestError>>>
export type GenuineStack = Assert<NotAny<ComponentProps<typeof StackTrace>>>
export type GenuineFrames = Assert<NotAny<ComponentProps<typeof StackTraceFrames>>>
export type GenuineCommit = Assert<NotAny<ComponentProps<typeof Commit>>>
export type GenuineFiles = Assert<NotAny<ComponentProps<typeof CommitFiles>>>
export type GenuineFile = Assert<NotAny<ComponentProps<typeof CommitFile>>>
// @ts-expect-error raw unknown status cannot masquerade as a kit TestStatus
const invalid: ComponentProps<typeof Test> = { name: "unknown", status: "unknown" }
// @ts-expect-error duration is authored numeric milliseconds, not strings
const duration: ComponentProps<typeof Test> = { name: "bad", status: "passed", duration: "1ms" }
void invalid
void duration
