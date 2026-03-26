import { runContentDecision } from "./contentDecisionHandler.ts"

export async function runContentDecisionDemo() {
  const inputs = [
    {
      source_url: "https://www.reddit.com/r/amazonsellers/comments/abc123/high_acos_and_ad_spend/"
    },
    {
      source_url: "https://www.reddit.com/r/youtube/comments/def456/faceless_video_pipeline/"
    },
    {
      source_url: "https://www.reddit.com/r/startups/comments/ghi789/general_founder_frustration/"
    }
  ]

  const results = []

  for (const input of inputs) {
    results.push(await runContentDecision(input))
  }

  return {
    results
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runContentDecisionDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
