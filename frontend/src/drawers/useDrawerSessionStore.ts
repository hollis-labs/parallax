import { useCallback, useMemo, useSyncExternalStore } from "react"
import { DRAWER_GEOMETRY } from "./geometry"
import type {
  ChatPrimaryDrawerSessionState,
  ChatWorkingDrawerSessionState,
  DrawerPinnedCard,
  DrawerSessionState,
  DynamicCardTab,
} from "./types"

const STORAGE_KEY = "parallax_drawers_layout_v1"

export const DEFAULT_PRIMARY_DRAWER: ChatPrimaryDrawerSessionState = {
  open: true,
  height: DRAWER_GEOMETRY.primaryDefault,
  activeTab: "documents",
  pinnedCards: [],
}

export const DEFAULT_WORKING_DRAWER: ChatWorkingDrawerSessionState = {
  open: true,
  height: DRAWER_GEOMETRY.workingDefault,
  activeTab: "scratchpad",
  cardTabs: [],
}

function emptySessionState(): DrawerSessionState {
  return {
    primaryDrawer: { ...DEFAULT_PRIMARY_DRAWER, pinnedCards: [] },
    workingDrawer: { ...DEFAULT_WORKING_DRAWER, cardTabs: [] },
  }
}

interface PersistedDrawerLayout {
  open: boolean
  height: number
  activeTab: string
}

interface PersistedSessionLayout {
  primaryDrawer?: Partial<PersistedDrawerLayout>
  workingDrawer?: Partial<PersistedDrawerLayout>
}

type StoreData = Record<string, DrawerSessionState>

let memoryStore: StoreData = {}
const listeners = new Set<() => void>()

function sanitizeHeight(h: unknown, fallback: number): number {
  if (typeof h === "number" && Number.isFinite(h)) {
    return Math.max(DRAWER_GEOMETRY.minimum, Math.min(DRAWER_GEOMETRY.maximum, Math.round(h)))
  }
  return fallback
}

function sanitizeLayout(
  raw: unknown,
  defaultState: typeof DEFAULT_PRIMARY_DRAWER | typeof DEFAULT_WORKING_DRAWER,
): PersistedDrawerLayout {
  if (!raw || typeof raw !== "object") {
    return {
      open: defaultState.open,
      height: defaultState.height,
      activeTab: defaultState.activeTab,
    }
  }
  const obj = raw as Record<string, unknown>
  const open = typeof obj.open === "boolean" ? obj.open : defaultState.open
  const height = sanitizeHeight(obj.height, defaultState.height)
  // Dynamic card tabs and pins are transient in-memory and not restored
  const activeTabRaw = typeof obj.activeTab === "string" ? obj.activeTab : defaultState.activeTab
  const allowedTabs =
    defaultState === DEFAULT_PRIMARY_DRAWER
      ? ["documents", "reports", "diffs", "tools", "pins"]
      : ["scratchpad", "terminal-1", "terminal-2", "artifacts", "runtime", "session-context"]
  const activeTab = allowedTabs.includes(activeTabRaw) ? activeTabRaw : defaultState.activeTab
  return { open, height, activeTab }
}

function loadInitialStore(): StoreData {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const validated: StoreData = {}
        for (const [key, session] of Object.entries(parsed as Record<string, unknown>)) {
          if (!session || typeof session !== "object" || Array.isArray(session)) continue
          const sessObj = session as Record<string, unknown>
          const primary = sanitizeLayout(sessObj.primaryDrawer, DEFAULT_PRIMARY_DRAWER)
          const working = sanitizeLayout(sessObj.workingDrawer, DEFAULT_WORKING_DRAWER)
          validated[key] = {
            primaryDrawer: {
              ...DEFAULT_PRIMARY_DRAWER,
              ...primary,
              pinnedCards: [], // transient: not restored from localStorage
            },
            workingDrawer: {
              ...DEFAULT_WORKING_DRAWER,
              ...working,
              cardTabs: [], // transient: not restored from localStorage
            },
          }
        }
        return validated
      }
    }
  } catch {
    // localStorage unavailable or malformed
  }
  return {}
}

memoryStore = loadInitialStore()

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      const external = loadInitialStore()
      // Preserve live in-memory transient tabs/pins while syncing layout
      for (const [key, extSess] of Object.entries(external)) {
        const mem = memoryStore[key]
        external[key] = {
          primaryDrawer: {
            ...extSess.primaryDrawer,
            pinnedCards: mem?.primaryDrawer.pinnedCards ?? [],
          },
          workingDrawer: {
            ...extSess.workingDrawer,
            cardTabs: mem?.workingDrawer.cardTabs ?? [],
          },
        }
      }
      memoryStore = external
      listeners.forEach((listener) => {
        listener()
      })
    }
  })
}

function saveStore(next: StoreData) {
  memoryStore = next
  try {
    // Persist layout only — transient cardTabs and panel envelopes are memory-only
    const layoutOnly: Record<string, PersistedSessionLayout> = {}
    for (const [key, sess] of Object.entries(memoryStore)) {
      layoutOnly[key] = {
        primaryDrawer: {
          open: sess.primaryDrawer.open,
          height: sess.primaryDrawer.height,
          activeTab: sess.primaryDrawer.activeTab.startsWith("pin:")
            ? DEFAULT_PRIMARY_DRAWER.activeTab
            : sess.primaryDrawer.activeTab,
        },
        workingDrawer: {
          open: sess.workingDrawer.open,
          height: sess.workingDrawer.height,
          activeTab: sess.workingDrawer.activeTab.startsWith("card:")
            ? DEFAULT_WORKING_DRAWER.activeTab
            : sess.workingDrawer.activeTab,
        },
      }
    }
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(layoutOnly))
  } catch {
    // quota exceeded or blocked
  }
  listeners.forEach((listener) => {
    listener()
  })
}

export function getDrawerSessionState(sessionId: string): DrawerSessionState {
  if (!sessionId) return emptySessionState()
  const found = Object.hasOwn(memoryStore, sessionId) ? memoryStore[sessionId] : undefined
  if (!found) {
    return emptySessionState()
  }
  return {
    primaryDrawer: {
      ...DEFAULT_PRIMARY_DRAWER,
      ...found.primaryDrawer,
      pinnedCards: found.primaryDrawer?.pinnedCards ?? [],
    },
    workingDrawer: {
      ...DEFAULT_WORKING_DRAWER,
      ...found.workingDrawer,
      cardTabs: found.workingDrawer?.cardTabs ?? [],
    },
  }
}

export function setPrimaryDrawerState(
  sessionId: string,
  patch: Partial<ChatPrimaryDrawerSessionState>,
) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const next: DrawerSessionState = {
    ...current,
    primaryDrawer: {
      ...current.primaryDrawer,
      ...patch,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function setWorkingDrawerState(
  sessionId: string,
  patch: Partial<ChatWorkingDrawerSessionState>,
) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const next: DrawerSessionState = {
    ...current,
    workingDrawer: {
      ...current.workingDrawer,
      ...patch,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function appendWorkingDrawerCardTab(sessionId: string, tab: DynamicCardTab) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const existing = current.workingDrawer.cardTabs.filter((t) => t.id !== tab.id)
  const nextTabs = [...existing, tab]
  const next: DrawerSessionState = {
    ...current,
    workingDrawer: {
      ...current.workingDrawer,
      cardTabs: nextTabs,
      activeTab: tab.focused ? tab.id : current.workingDrawer.activeTab,
      open: true,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function removeWorkingDrawerCardTab(sessionId: string, tabId: string) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const nextTabs = current.workingDrawer.cardTabs.filter((t) => t.id !== tabId)
  const nextPrimaryPinned = current.primaryDrawer.pinnedCards.filter((c) => c.id !== tabId)
  const activeWas = current.workingDrawer.activeTab === tabId
  const nextActive = activeWas ? DEFAULT_WORKING_DRAWER.activeTab : current.workingDrawer.activeTab
  const next: DrawerSessionState = {
    ...current,
    workingDrawer: {
      ...current.workingDrawer,
      cardTabs: nextTabs,
      activeTab: nextActive,
    },
    primaryDrawer: {
      ...current.primaryDrawer,
      pinnedCards: nextPrimaryPinned,
      activeTab:
        current.primaryDrawer.activeTab === `pin:${tabId}`
          ? DEFAULT_PRIMARY_DRAWER.activeTab
          : current.primaryDrawer.activeTab,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function togglePinWorkingDrawerCardTab(sessionId: string, tabId: string) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const target = current.workingDrawer.cardTabs.find((t) => t.id === tabId)
  if (!target) return
  const nextPinned = !target.pinned
  const nextTabs = current.workingDrawer.cardTabs.map((t) =>
    t.id === tabId ? { ...t, pinned: nextPinned } : t,
  )

  let nextPrimaryPinnedCards = current.primaryDrawer.pinnedCards
  if (nextPinned) {
    if (!nextPrimaryPinnedCards.some((c) => c.id === target.id)) {
      nextPrimaryPinnedCards = [
        ...nextPrimaryPinnedCards,
        {
          id: target.id,
          title: target.label,
          card_type: "dynamic-card",
          content_ref: target.id,
          payload:
            typeof target.payload === "string"
              ? target.payload
              : JSON.stringify(target.payload ?? {}),
        },
      ]
    }
  } else {
    nextPrimaryPinnedCards = nextPrimaryPinnedCards.filter((c) => c.id !== target.id)
  }

  const next: DrawerSessionState = {
    ...current,
    workingDrawer: {
      ...current.workingDrawer,
      cardTabs: nextTabs,
    },
    primaryDrawer: {
      ...current.primaryDrawer,
      pinnedCards: nextPrimaryPinnedCards,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function pinPrimaryDrawerCard(sessionId: string, card: DrawerPinnedCard) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const existing = current.primaryDrawer.pinnedCards.filter((c) => c.id !== card.id)
  const nextCards = [...existing, card]
  const next: DrawerSessionState = {
    ...current,
    primaryDrawer: {
      ...current.primaryDrawer,
      pinnedCards: nextCards,
      activeTab: `pin:${card.id}`,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function unpinPrimaryDrawerCard(sessionId: string, cardId: string) {
  if (!sessionId) return
  const current = getDrawerSessionState(sessionId)
  const nextCards = current.primaryDrawer.pinnedCards.filter((c) => c.id !== cardId)
  const activeWas = current.primaryDrawer.activeTab === `pin:${cardId}`
  const nextActive = activeWas ? DEFAULT_PRIMARY_DRAWER.activeTab : current.primaryDrawer.activeTab
  const nextWorkingTabs = current.workingDrawer.cardTabs.map((t) =>
    t.id === cardId ? { ...t, pinned: false } : t,
  )
  const next: DrawerSessionState = {
    ...current,
    primaryDrawer: {
      ...current.primaryDrawer,
      pinnedCards: nextCards,
      activeTab: nextActive,
    },
    workingDrawer: {
      ...current.workingDrawer,
      cardTabs: nextWorkingTabs,
    },
  }
  saveStore({
    ...memoryStore,
    [sessionId]: next,
  })
}

export function resetDrawerSession(sessionId: string) {
  if (!sessionId) return
  saveStore({
    ...memoryStore,
    [sessionId]: emptySessionState(),
  })
}

export function clearAllDrawerSessions() {
  saveStore({})
}

export function useDrawerSession(sessionId: string) {
  // A subscription activation is a lease. Cleanup permanently retires its epoch,
  // even when React reconnects the same hook after StrictMode or Activity cleanup.
  const admission = useMemo(() => ({ active: false, epoch: 0, sessionId }), [sessionId])
  const subscribeSession = useCallback(
    (listener: () => void) => {
      const activation = ++admission.epoch
      admission.active = true
      listeners.add(listener)
      listener()
      return () => {
        listeners.delete(listener)
        if (admission.epoch === activation) admission.active = false
      }
    },
    [admission],
  )
  const getSnapshot = useCallback(
    () => JSON.stringify([admission.epoch, getDrawerSessionState(sessionId)]),
    [sessionId, admission],
  )
  const rawState = useSyncExternalStore(subscribeSession, getSnapshot, getSnapshot)
  const [epoch, state]: [number, DrawerSessionState] = JSON.parse(rawState)

  const setPrimary = useCallback(
    (patch: Partial<ChatPrimaryDrawerSessionState>) => {
      if (!admission.active || admission.epoch !== epoch) return
      setPrimaryDrawerState(sessionId, patch)
    },
    [sessionId, admission, epoch],
  )

  const setWorking = useCallback(
    (patch: Partial<ChatWorkingDrawerSessionState>) => {
      if (!admission.active || admission.epoch !== epoch) return
      setWorkingDrawerState(sessionId, patch)
    },
    [sessionId, admission, epoch],
  )

  const appendCard = useCallback(
    (tab: DynamicCardTab) => {
      if (!admission.active || admission.epoch !== epoch) return
      appendWorkingDrawerCardTab(sessionId, tab)
    },
    [sessionId, admission, epoch],
  )

  const removeCard = useCallback(
    (tabId: string) => {
      if (!admission.active || admission.epoch !== epoch) return
      removeWorkingDrawerCardTab(sessionId, tabId)
    },
    [sessionId, admission, epoch],
  )

  const togglePinCard = useCallback(
    (tabId: string) => {
      if (!admission.active || admission.epoch !== epoch) return
      togglePinWorkingDrawerCardTab(sessionId, tabId)
    },
    [sessionId, admission, epoch],
  )

  const pinCard = useCallback(
    (card: DrawerPinnedCard) => {
      if (!admission.active || admission.epoch !== epoch) return
      pinPrimaryDrawerCard(sessionId, card)
    },
    [sessionId, admission, epoch],
  )

  const unpinCard = useCallback(
    (cardId: string) => {
      if (!admission.active || admission.epoch !== epoch) return
      unpinPrimaryDrawerCard(sessionId, cardId)
    },
    [sessionId, admission, epoch],
  )

  const reset = useCallback(() => {
    if (!admission.active || admission.epoch !== epoch) return
    resetDrawerSession(sessionId)
  }, [sessionId, admission, epoch])

  return {
    primaryDrawer: state.primaryDrawer,
    workingDrawer: state.workingDrawer,
    setPrimaryDrawer: setPrimary,
    setWorkingDrawer: setWorking,
    appendCardTab: appendCard,
    removeCardTab: removeCard,
    togglePinCardTab: togglePinCard,
    pinPrimaryCard: pinCard,
    unpinPrimaryCard: unpinCard,
    resetSession: reset,
  }
}
