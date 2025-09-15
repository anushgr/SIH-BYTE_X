"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

type Messages = Record<string, string>

function translateTextNodes(root: Element, messages: Messages) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  const toUpdate: { node: Text; newValue: string }[] = []
  let current = walker.nextNode()
  while (current) {
    const node = current as Text
    const original = node.nodeValue || ""
    const trimmed = original.trim()
    if (trimmed && messages[trimmed]) {
      const leading = original.match(/^\s*/)?.[0] || ""
      const trailing = original.match(/\s*$/)?.[0] || ""
      toUpdate.push({ node, newValue: `${leading}${messages[trimmed]}${trailing}` })
    }
    current = walker.nextNode()
  }
  toUpdate.forEach(({ node, newValue }) => (node.nodeValue = newValue))
}

function translateAttributes(messages: Messages) {
  const attrMap = ["placeholder", "aria-label", "title"]
  const all = document.querySelectorAll<HTMLElement>("*")
  all.forEach((el) => {
    attrMap.forEach((attr) => {
      const val = el.getAttribute(attr)
      if (val && messages[val]) {
        el.setAttribute(attr, messages[val])
      }
    })
    
    // Handle data-translate attributes
    const translateKey = el.getAttribute("data-translate")
    if (translateKey && messages[translateKey]) {
      el.textContent = messages[translateKey]
    }
  })
}

function snapshotOriginals() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null)
  let current = walker.nextNode()
  while (current) {
    const node = current as Text
    if ((node as any)._orig === undefined) {
      ;(node as any)._orig = node.nodeValue
    }
    current = walker.nextNode()
  }

  const all = document.querySelectorAll<HTMLElement>("*")
  all.forEach((el) => {
    if ((el as any)._orig_attrs === undefined) {
      const attrs: Record<string, string> = {}
      ;["placeholder", "aria-label", "title"].forEach((a) => {
        const v = el.getAttribute(a)
        if (v) attrs[a] = v
      })
      ;(el as any)._orig_attrs = attrs
    }
    
    // Store original text content for data-translate elements
    if (el.getAttribute("data-translate") && (el as any)._orig_text === undefined) {
      ;(el as any)._orig_text = el.textContent
    }
  })
}

function restoreOriginals() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null)
  let current = walker.nextNode()
  while (current) {
    const node = current as Text
    if ((node as any)._orig !== undefined) {
      node.nodeValue = (node as any)._orig
    }
    current = walker.nextNode()
  }

  const all = document.querySelectorAll<HTMLElement>("*")
  all.forEach((el) => {
    const attrs = (el as any)._orig_attrs as Record<string, string> | undefined
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    }
    
    // Restore original text content for data-translate elements
    if (el.getAttribute("data-translate") && (el as any)._orig_text !== undefined) {
      el.textContent = (el as any)._orig_text
    }
  })
}

async function loadMessages(lang: string): Promise<Messages> {
  try {
    const mod = await import(`@/messages/${lang}.json`)
    return (mod.default || {}) as Messages
  } catch {
    return {}
  }
}

async function applyAll(messages: Messages) {
  translateTextNodes(document.body, messages)
  translateAttributes(messages)
}

export function I18nClient() {
  const pathname = usePathname()

  useEffect(() => {
    const applyLang = async (lang: string) => {
      try {
        if (lang === 'en') {
          restoreOriginals()
        } else {
          const msgs = await loadMessages(lang)
          if (Object.keys(msgs).length === 0) return
          snapshotOriginals()
          await applyAll(msgs)
        }
      } catch {}
    }

    const initial = (typeof window !== 'undefined' && localStorage.getItem("lang")) || "en"
    applyLang(initial)

    const langChangedHandler = (e: Event) => {
      const custom = e as CustomEvent
      const lang = (custom.detail && custom.detail.lang) || localStorage.getItem("lang") || "en"
      applyLang(lang)
    }

    const storageHandler = () => {
      const lang = localStorage.getItem("lang") || "en"
      applyLang(lang)
    }

    window.addEventListener("lang-changed", langChangedHandler)
    window.addEventListener("storage", storageHandler)

    return () => {
      window.removeEventListener("lang-changed", langChangedHandler)
      window.removeEventListener("storage", storageHandler)
    }
  }, [])

  // Re-apply translation when navigating to a new route so new nodes get translated
  useEffect(() => {
    const lang = (typeof window !== 'undefined' && localStorage.getItem("lang")) || "en"
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("lang-changed", { detail: { lang } }))
    }, 10)
  }, [pathname])

  return null
}
