.PHONY: run build check fixtures ui-dev storybook pins lint scan generate
SUBSTRATE := go run github.com/hollis-labs/substrate/cmd/substrate
export TMPDIR := $(CURDIR)/.scratch/tmp
export GOCACHE := $(CURDIR)/.scratch/gocache
export GOMODCACHE := $(CURDIR)/.scratch/gomodcache
export npm_config_cache := $(CURDIR)/.scratch/npm
prepare:
	mkdir -p $(TMPDIR) $(GOCACHE) $(GOMODCACHE)
fixtures: prepare
	go run ./cmd/fixtures
	cd frontend && ./node_modules/.bin/biome format --write src/fixtures
build: prepare
	cd frontend && npm ci && npm run build
	go build -o .scratch/parallax ./cmd/parallax
run: build
	.scratch/parallax
check: prepare
	cd frontend && npm ci
	go test -race ./cmd/... ./internal/...
	go vet ./cmd/... ./internal/...
	$(SUBSTRATE) pins check --app .
	cd frontend && npm run typecheck && npm run lint && npm run build
	node scripts/check-design-css.mjs
	node scripts/check-optional-imports.mjs
	go build -o .scratch/parallax ./cmd/parallax
ui-dev:
	cd frontend && npm run dev -- --host 127.0.0.1
coverage-check:
	node scripts/coverage.mjs --check
storybook:
	cd frontend && npm run storybook
browser: check
	STORYBOOK_DISABLE_TELEMETRY=1 npm run build-storybook --prefix frontend
	node scripts/coverage.mjs --check
	CI=true npm exec --prefix frontend -- playwright test --config frontend/playwright.config.ts
pins:
	$(SUBSTRATE) pins check --app .
generate:
	$(SUBSTRATE) generate -f cmd/parallax/substrate.yaml
lint:
	go run github.com/golangci/golangci-lint/v2/cmd/golangci-lint@v2.11.4 run
scan:
	python3 scripts/scan-public --ref HEAD
