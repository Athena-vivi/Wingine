import { resolveRedditUrl } from "../core/modules/radar/capabilities/redditUrlResolver.ts"

export async function runRedditUrlResolverDemo(canonicalUrl: string, shareUrl: string) {
  const canonical = await resolveRedditUrl(canonicalUrl)
  const share = await resolveRedditUrl(shareUrl)

  return {
    canonical,
    share,
    same_resolved_url: canonical.resolved_url === share.resolved_url
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  const canonicalUrl = process.argv[2]
  const shareUrl = process.argv[3]

  if (!canonicalUrl || !shareUrl) {
    console.error("Usage: node demos/redditUrlResolverDemo.ts <canonical-url> <share-url>")
    process.exit(1)
  }

  runRedditUrlResolverDemo(canonicalUrl, shareUrl)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
