import { resolveSourceInput } from "../core/modules/radar/capabilities/sourceInputResolver.ts"
import { resolveSourceMaterial } from "../core/modules/radar/capabilities/sourceMaterialNormalizer.ts"

export async function runRedditInputDiagnosisDemo(sourceUrl: string) {
  const resolver = resolveSourceInput({
    redditUrl: sourceUrl,
    postText: "",
    comments: "",
    notes: "reddit_input_diagnosis"
  })

  const normalized = await resolveSourceMaterial({
    sourceMode: resolver.sourceMode,
    normalizedInput: resolver.normalizedInput
  })

  return {
    source_url: sourceUrl,
    source_mode: normalized.sourceMode,
    diagnostics: normalized.source.diagnostics ?? null,
    resolved_source: {
      url: normalized.source.url,
      title: normalized.source.title,
      selftext_length: normalized.source.selftext.length,
      comments_count: normalized.source.comments.length
    }
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  const sourceUrl = process.argv[2]

  if (!sourceUrl) {
    console.error("Usage: node demos/redditInputDiagnosisDemo.ts <reddit-url>")
    process.exit(1)
  }

  runRedditInputDiagnosisDemo(sourceUrl)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
