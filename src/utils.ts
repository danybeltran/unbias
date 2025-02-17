import { Client, serialize } from "http-react"
import { parse } from "node-html-parser"

import { format } from "date-fns"
import { deburr } from "lodash"
import copy from "copy-to-clipboard"
import { es } from "date-fns/locale/es"
import { enUS } from "date-fns/locale/en-US"
import Cookies from "js-cookie"

export function formatDate(
  date: Date,
  lang: string = Cookies.get("lang") || "en"
): string {
  return format(date, "dd MMMM yyyy, hh:mm aaaa", {
    locale: {
      es: es,
      en: enUS,
    }[lang],
  })
}

/**
 * This function removes accents from a string or list of strings,
 * as well as capital letters
 * @param target The string or list of strings
 */
export function strSimplify<T = string | string[]>(
  target: T,
  lowecase?: boolean
) {
  let result: any = null

  if (typeof target === "string") {
    result = lowecase ? deburr(target).toLowerCase() : deburr(target)
  } else if (Array.isArray(target)) {
    result = target.map((s) => (lowecase ? deburr(s).toLowerCase() : deburr(s)))
  }

  return result as T extends string ? string : string[]
}

export function settifyArray(arr: string[]) {
  return Array.from(new Set(arr))
}

export function copyText(text: string) {
  copy(text)
}

export function shuffleArray<T = any>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

async function getDocument(url: string) {
  const { data } = await Client.get(url, {
    resolver(res) {
      return res.text()
    },
  })

  return parse(data)
}

export async function getWebsiteCleanData(
  website_url: string /* Some valid html as plain text */
) {
  let website_html = await getDocument(website_url)

  const website_title =
    (
      website_html.querySelector("title") ||
      website_html.querySelector("h1") ||
      website_html.querySelector("h2") ||
      website_html.querySelector("h3") ||
      website_html.querySelector("h5") ||
      website_html.querySelector("h6")
    )?.innerHTML || "No title" // attempts to get the title

  let t: string[] = []

  function appendToText(e: any) {
    if (e.nodeType === 3) {
      t.push(e.text)
      return
    }

    // Exclude script, style, head, footer, and nav tags
    if (
      e.tagName === "SCRIPT" ||
      e.tagName === "STYLE" ||
      e.tagName === "HEAD" ||
      e.tagName === "FOOTER" ||
      e.tagName === "NAV" ||
      e.tagName === "LINK" ||
      e.tagname === "IMG" ||
      e.tagName === "NOSCRIPT"
    ) {
      return
    }

    if (
      e.tagName === "H1" ||
      e.tagName === "H2" ||
      e.tagName === "H3" ||
      e.tagName === "H4" ||
      e.tagName === "H5" ||
      e.tagName === "H6" ||
      e.tagName === "P" ||
      e.tagName === "A" ||
      e.tagName === "BUTTON"
    ) {
      if (e.text) {
        t.push(e.text)
      }

      if (e.childNodes && e.childNodes.length > 0) {
        // @ts-expect-error
        e.childNodes.forEach((child) => appendToText(child))
      }
    } else if (e.childNodes && e.childNodes.length > 0) {
      // @ts-expect-error
      e.childNodes.forEach((child) => appendToText(child))
    }
  }

  const body = website_html.querySelector("body")
  if (body) {
    appendToText(body)
  } else {
    appendToText(website_html)
  }

  let clean_text = t.join("").replace(/\t/g, "").replace(/\n+/g, "\n")

  const outer_html = website_html.outerHTML

  return {
    character_count: clean_text.length,
    unoptimized_character_count: outer_html.length,
    title: website_title,
    text: clean_text,
  }
}
