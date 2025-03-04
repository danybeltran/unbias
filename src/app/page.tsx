"use client"
import { useFetch } from "atomic-utils"
import Image from "next/image"
import { useEffect, useState } from "react"

import markdownit from "markdown-it"
import Link from "next/link"
const md = markdownit()

const startStream = async ({
  url,
  onChunkParse,
}: {
  url: string
  onChunkParse(chunk: string): void
}) => {
  const response = await fetch("/api/unbias", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
    }),
    keepalive: true,
  })
  // @ts-expect-error
  for await (const chunk of response?.body) {
    const txt = new TextDecoder().decode(chunk)
    onChunkParse(txt)
  }
}

export default function Home() {
  const [parts, setParts] = useState<string[]>([])

  const [url, setUrl] = useState("")

  const startBiasCheck = () => {
    setParts([])
    startStream({
      url,
      onChunkParse(chunk) {
        setParts((previousParts) => [...previousParts, chunk])
      },
    })
  }

  return (
    <div className="p-4">
      <div className="print:hidden">
        <div className="py-4 text-center">
          <h2 className="text-lg font-semibold text-center">
            Encontrar sesgos en noticias
          </h2>
          <Link
            className="underline text-blue-600"
            href="https://github.com/danybeltran/unbias/"
            target="_blank"
          >
            Ver código en Github
          </Link>
        </div>

        <div className="text-center">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="p-2 border-2 border-blue-500 bg-background w-[60%]"
            placeholder="URL de la noticia"
          />

          <button
            className="p-2 border-2 border-blue-600 text-white bg-blue-500"
            onClick={startBiasCheck}
          >
            Buscar
          </button>
        </div>

        <div className="py-10">
          <div className="text-center">
            <button
              className="p-2 border-2 border-blue-600 text-white bg-blue-500"
              onClick={() => print()}
            >
              Imprimir
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div
          className="prose py-10"
          dangerouslySetInnerHTML={{
            __html: md.render(parts.join("")),
          }}
        />
      </div>
    </div>
  )
}
