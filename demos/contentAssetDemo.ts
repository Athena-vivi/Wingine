import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher
} from "../core/runtime/index.ts"
import { buildContentAsset, type ContentAsset } from "../core/modules/content/contentAssetBuilder.ts"
import type { ProblemObject } from "../core/modules/shared/index.ts"
import { runContentDecision } from "../usecases/contentDecision/contentDecisionHandler.ts"

function createProblemObject(): ProblemObject {
  return {
    id: "problem_demo_content_asset",
    type: "problem",
    source: {
      system: "radar",
      origin_id: "demo_problem",
      origin_ref: "demos/contentAssetDemo.ts"
    },
    status: "qualified",
    metadata: {
      tags: ["demo", "ads"],
      labels: ["content"],
      custom: {
        type: "ads",
        audience: "amazon sellers"
      }
    },
    timestamps: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      observed_at: new Date().toISOString()
    },
    title: "Amazon seller ad efficiency issue",
    summary: "Seller is spending too much on ads without efficient return.",
    description: "High ACoS and wasted ad spend are reducing profitability.",
    normalized_problem: "Amazon seller has high ACoS and wasted ad spend",
    record_worthy: true
  }
}

function createContentAssetRuntime() {
  const registry = createModuleRegistry()
  const activityLogStore = createActivityLogStore()
  const dispatcher = createProtocolDispatcher({
    registry,
    activityLogStore
  })

  registry.register({
    module: {
      module_id: "builder.content_asset_builder",
      system: "builder",
      actions: ["build"],
      input_contract: "problem_object",
      output_contract: "content_asset",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/content/contentAssetBuilder.ts.buildContentAsset",
      handler: (input) => buildContentAsset(input as ProblemObject)
    }
  })

  return {
    dispatcher,
    activityLogStore
  }
}

export async function runContentAssetDemo(): Promise<{
  problem: ProblemObject
  content_asset: ContentAsset
  decision_result: Awaited<ReturnType<typeof runContentDecision>>
}> {
  const { dispatcher } = createContentAssetRuntime()
  const problem = createProblemObject()

  const response = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "content-asset-demo-build",
    module: "builder.content_asset_builder",
    action: "build",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-asset-demo"
    },
    input: problem,
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const decision_result = await runContentDecision({
    source_url: "https://www.reddit.com/r/amazonsellers/comments/abc123/high_acos_and_ad_spend/"
  })

  return {
    problem,
    content_asset: response.output as ContentAsset,
    decision_result
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runContentAssetDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
