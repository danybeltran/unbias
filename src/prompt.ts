import { google } from "@ai-sdk/google"
import { generateObject, streamText } from "ai"
import { Schema, z } from "zod"

const model = google("gemini-2.0-flash-exp")

export async function promptObject<Obj>({
  schema,
  prompt,
}: {
  schema: z.Schema<Obj, z.ZodTypeDef, any> | Schema<Obj>
  prompt: string
}) {
  return generateObject({
    model: model,
    schema: schema,
    prompt,
  })
}

export async function promptText({ prompt }: { prompt: string }) {
  const stream = streamText({
    model,
    prompt,
  })

  // Return a ReadableStream
  return new ReadableStream({
    async pull(controller) {
      for await (const chunk of stream.textStream) {
        // Iterate over the async generator
        controller.enqueue(new TextEncoder().encode(chunk)) // Encode the chunk to bytes
      }
      controller.close()
    },
  })
}
