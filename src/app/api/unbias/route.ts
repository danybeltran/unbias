import { promptText } from "@/prompt"
import { getWebsiteCleanData } from "@/utils"

export async function POST(request: Request) {
  const { url } = await request.json()

  const pageData = await getWebsiteCleanData(url)

  const req = await promptText({
    prompt: `
You are presented the contents of a news publication. Your task is to impartially find biases in it and respond with markdown with
this h1 title: "${pageData.title}"
Specify the bias name, what it consists of, where in the contents it's present, and why it is
that specific bias, everything in the same language the content is written in.

TITLE: ${pageData.title}
<-----------Content starts here-------------->
${pageData.text}
<-----------Content ends here-------------->
`,
  })

  const headers = new Headers()
  headers.set("Content-Type", "text/event-stream")
  headers.set("Cache-Control", "no-cache")
  headers.set("Connection", "keep-alive")

  return new Response(req, { headers })
}
