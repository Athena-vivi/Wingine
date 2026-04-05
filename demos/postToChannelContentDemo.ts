import { postToChannelContentHandler } from "../usecases/postToChannelContent/postToChannelContentHandler.ts"

export async function runPostToChannelContentDemo() {
  return postToChannelContentHandler({
    title: "Amazon seller has high ACoS",
    post_content: "Amazon seller has high ACoS and wasted ad spend because keyword targeting is weak and reporting is noisy.",
    comments: "We see this every week.\nThe keyword structure is too broad.\nThey need a clearer reporting loop.",
    channel: "xiaohongshu",
    mode: "auto"
  })
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runPostToChannelContentDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
