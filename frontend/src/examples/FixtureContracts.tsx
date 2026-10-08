import { fixtureContracts } from "./contracts"

export function FixtureContracts() {
  return (
    <section className="torque-family-contracts" aria-label="Bundled fixture-family contracts">
      <h2>Bundled fixture contracts</h2>
      <p>
        Each family owns its supplied reference clock. Equal clocks in this fixture pack do not make
        other families follow the operations cutoff. Counts describe bundled records, not current
        admitted results.
      </p>
      <div className="torque-contract-grid">
        {fixtureContracts.families.map((f) => (
          <article key={f.id} aria-label={`${f.id} fixture contract`}>
            <h3>{f.version}</h3>
            <dl>
              <dt>Generator / seed</dt>
              <dd>
                {f.generator} / {f.seed}
              </dd>
              <dt>Reference UTC</dt>
              <dd>
                <time>{f.referenceClock}</time>
              </dd>
              <dt>Evidence policy</dt>
              <dd>{f.policy}</dd>
            </dl>
            {f.profiles.map((p) => (
              <div key={p.artifact}>
                <p>
                  {p.label} · {p.labelKind}
                </p>
                {"version" in p && (
                  <p>
                    Profile identity: {String(p.version)} /{" "}
                    {"generator" in p ? String(p.generator) : f.generator}
                  </p>
                )}
                {"from" in p && (
                  <p>
                    Supplied coverage: {String(p.from)} → {"to" in p ? String(p.to) : "Unknown"}
                  </p>
                )}
                {"recordedAt" in p && <p>Evidence recorded UTC: {String(p.recordedAt)}</p>}
                <p>
                  {Object.entries(p.counts)
                    .filter(([, n]) => typeof n === "number")
                    .map(([k, n]) => `${k}: ${n}`)
                    .join(" · ")}
                </p>
              </div>
            ))}
            <details>
              <summary>Relationships, coverage and remaining scope</summary>
              <p>{f.unknownPolicy}</p>
              <p>{f.resourcePolicy}</p>
              <ul>
                {f.joins.map((j) => (
                  <li key={j}>{j}</li>
                ))}
              </ul>
              <p>Existing validation: {f.validators.join("; ")}</p>
              <ul>
                {f.remaining.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </details>
          </article>
        ))}
      </div>
    </section>
  )
}
