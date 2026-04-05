import { postToChannelContentHandler } from "../../../usecases/postToChannelContent/postToChannelContentHandler.ts"

export async function POST(req: Request) {
  try {
    const {
      title = "",
      post_content = "",
      comments = "",
      channel = "xiaohongshu",
      mode = "auto"
    } = await req.json()

    if (!post_content || typeof post_content !== "string") {
      return Response.json({ error: "post_content is required" }, { status: 400 })
    }

    const result = await postToChannelContentHandler({
      title,
      post_content,
      comments,
      channel,
      mode
    })

    return Response.json(result)
  } catch (error) {
    return Response.json(
      {
        error: "internal_error",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
