import {
  Terminal,
  TerminalContent,
  TerminalHeader,
  TerminalTitle,
} from "@hollis-labs/kit-code/terminal"
import { developerFixture } from "./model"
export default function Output() {
  return (
    <section aria-label="Recorded terminal output">
      <p className="muted">
        Read-only authored output, not a terminal session. No command input or execution.
      </p>
      <Terminal output={developerFixture.terminal} autoScroll={false} maxChars={8192}>
        <TerminalHeader>
          <TerminalTitle>Authored output receipt</TerminalTitle>
        </TerminalHeader>
        <TerminalContent />
      </Terminal>
    </section>
  )
}
