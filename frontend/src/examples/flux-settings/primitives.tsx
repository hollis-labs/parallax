import type { LucideIcon } from "lucide-react"
import { ChevronDown, Monitor, Moon, Sun } from "lucide-react"
import type { ReactNode } from "react"
import type { ThemeMode } from "./model"

// --- PanelHeader ---

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-fg tracking-tight">{title}</h2>
        {description && (
          <p className="text-control text-fg-muted mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// --- SCard ---

export type SCardAccent = "brand" | "success" | "warning" | "danger" | "info" | "primary"

const SCARD_ACCENT_CLASSES: Record<SCardAccent, string> = {
  brand: "border-l-2 border-l-brand",
  success: "border-l-2 border-l-success",
  warning: "border-l-2 border-l-warning",
  danger: "border-l-2 border-l-danger",
  info: "border-l-2 border-l-info",
  primary: "border-l-2 border-l-primary",
}

export function SCard({
  title,
  meta,
  description,
  children,
  className = "",
  accent,
  action,
}: {
  title: string
  meta?: string
  description?: string
  children: ReactNode
  className?: string
  accent?: SCardAccent
  action?: ReactNode
}) {
  return (
    <div
      className={`bg-bg-elevated border border-border-subtle rounded-panel overflow-hidden mb-4 shadow-xs ${
        accent ? SCARD_ACCENT_CLASSES[accent] : ""
      } ${className}`}
    >
      <div className="px-4 py-3 border-b border-border-subtle flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-label font-semibold uppercase tracking-wider text-fg-secondary">
              {title}
            </span>
            {meta && <span className="font-mono text-label text-fg-faint">{meta}</span>}
          </div>
          {description && <p className="text-xs text-fg-muted mt-0.5">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

// --- SRow ---

export function SRow({
  label,
  description,
  children,
  vertical = false,
  className = "",
  onClick,
  "data-shortcut-key": shortcutKey,
}: {
  label: string
  description?: string
  children: ReactNode
  vertical?: boolean
  className?: string
  onClick?: () => void
  "data-shortcut-key"?: string
}) {
  if (onClick) {
    if (vertical) {
      return (
        <button
          type="button"
          data-shortcut-key={shortcutKey}
          onClick={onClick}
          className={`text-left w-full px-4 py-3 space-y-2 border-b border-border-subtle [&:last-child]:border-b-0 cursor-pointer ${className}`}
        >
          <div className="min-w-0">
            <div className="text-control text-fg font-medium">{label}</div>
            {description && <div className="text-xs text-fg-muted mt-0.5">{description}</div>}
          </div>
          <div>{children}</div>
        </button>
      )
    }
    return (
      <button
        type="button"
        data-shortcut-key={shortcutKey}
        onClick={onClick}
        className={`text-left w-full flex items-center justify-between gap-4 px-4 py-3 border-b border-border-subtle [&:last-child]:border-b-0 cursor-pointer ${className}`}
      >
        <div className="min-w-0 flex-1">
          <div className="text-control text-fg font-medium">{label}</div>
          {description && <div className="text-xs text-fg-muted mt-0.5">{description}</div>}
        </div>
        <div className="shrink-0">{children}</div>
      </button>
    )
  }

  if (vertical) {
    return (
      <div
        data-shortcut-key={shortcutKey}
        className={`px-4 py-3 space-y-2 border-b border-border-subtle [&:last-child]:border-b-0 ${className}`}
      >
        <div className="min-w-0">
          <div className="text-control text-fg font-medium">{label}</div>
          {description && <div className="text-xs text-fg-muted mt-0.5">{description}</div>}
        </div>
        <div>{children}</div>
      </div>
    )
  }
  return (
    <div
      data-shortcut-key={shortcutKey}
      className={`flex items-center justify-between gap-4 px-4 py-3 border-b border-border-subtle [&:last-child]:border-b-0 ${className}`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-control text-fg font-medium">{label}</div>
        {description && <div className="text-xs text-fg-muted mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// --- SToggle ---

export function SToggle({
  checked,
  onChange,
  disabled = false,
  variant = "default",
  "aria-label": ariaLabel,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  variant?: "default" | "warning"
  "aria-label"?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-150 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        checked
          ? variant === "warning"
            ? "bg-warning"
            : "bg-primary"
          : "bg-surface border border-border-subtle"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-150 ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

// --- SSelect ---

export interface SSelectOption {
  value: string
  label: string
}

export function SSelect({
  value,
  options,
  onChange,
  allowNone = false,
  disabled = false,
  width = "w-48",
  className = "",
  "aria-label": ariaLabel,
}: {
  value: string
  options: readonly SSelectOption[]
  onChange: (value: string) => void
  allowNone?: boolean
  disabled?: boolean
  width?: string
  className?: string
  "aria-label"?: string
}) {
  return (
    <div className={`relative ${width} ${className}`}>
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none w-full bg-surface border border-border-subtle rounded-control py-[7px] pl-3 pr-8 text-control text-fg focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {allowNone && <option value="">None</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-faint pointer-events-none" />
    </div>
  )
}

// --- STextField ---

export function STextField({
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
  width = "w-60",
  className = "",
  "aria-label": ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  type?: string
  width?: string
  className?: string
  "aria-label"?: string
}) {
  return (
    <input
      type={type}
      value={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-surface border border-border-subtle rounded-control py-[7px] px-3 text-control text-fg placeholder:text-fg-faint focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${width} ${className}`}
    />
  )
}

// --- ThemeSeg ---

const THEME_SEG_OPTIONS: { value: ThemeMode; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export function ThemeSeg({
  value,
  onChange,
}: {
  value: ThemeMode
  onChange: (value: ThemeMode) => void
}) {
  return (
    <div className="inline-flex p-[3px] gap-[2px] bg-surface border border-border-subtle rounded-control">
      {THEME_SEG_OPTIONS.map((opt) => {
        const Icon = opt.icon
        const isActive = value === opt.value
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-[5px] rounded-sm text-xs transition-colors cursor-pointer ${
              isActive
                ? "bg-bg-elevated text-fg font-medium shadow-xs"
                : "text-fg-muted hover:text-fg-secondary"
            }`}
          >
            <Icon className="w-3 h-3" />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// --- Kbd / KbdGroup ---

export function Kbd({
  children,
  active = false,
  className = "",
}: {
  children: ReactNode
  active?: boolean
  className?: string
}) {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-sm font-mono text-label font-medium transition-colors ${
        active
          ? "bg-primary-muted border border-primary text-primary"
          : "bg-surface border border-border-subtle text-fg-secondary shadow-xs"
      } ${className}`}
    >
      {children}
    </kbd>
  )
}

export function KbdGroup({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`inline-flex items-center gap-[3px] ${className}`}>{children}</div>
}
