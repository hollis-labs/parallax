.PHONY: run build check fixtures ui-dev storybook
export TMPDIR := $(CURDIR)/.scratch/tmp
export GOCACHE := $(CURDIR)/.scratch/gocache
export GOMODCACHE := $(CURDIR)/.scratch/gomodcache
export npm_config_cache := $(CURDIR)/.scratch/npm
prepare:
	mkdir -p $(TMPDIR) $(GOCACHE) $(GOMODCACHE)
fixtures: prepare
	go run ./cmd/fixtures
build: prepare
	cd frontend && npm ci && npm run build
	go build -o .scratch/parallax ./cmd/parallax
run: build
	.scratch/parallax
check: prepare
	cd frontend && npm ci
	go test -race ./cmd/... ./internal/...
	go vet ./cmd/... ./internal/...
	cd frontend && npm run typecheck && npm run lint && npm run build
	node scripts/check-design-css.mjs
	go build -o .scratch/parallax ./cmd/parallax
ui-dev:
	cd frontend && npm run dev -- --host 127.0.0.1
storybook:
	cd frontend && npm run storybook
browser: check
	STORYBOOK_DISABLE_TELEMETRY=1 npm run build-storybook --prefix frontend
	CI=true npm exec --prefix frontend -- playwright test --config frontend/playwright.config.ts
