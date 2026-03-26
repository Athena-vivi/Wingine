# Problem Radar Architecture

## Layers

### Capability Layer
- `source_input_resolver`
- `reddit_source_fetcher`
- `manual_source_builder`
- `source_material_normalizer`
- `problem_analysis_engine`
- `radar_record_builder`
- `insight_draft_builder`
- `radar_record_searcher`
- `radar_record_mapper`
- `radar_record_upsertor`
- `content_generation_engine`
- `content_rewrite_engine`
- `output_bundle_manager`

### Protocol Layer
- `workspace_load`
- `source_analyze`
- `radar_save`
- `content_generate`
- `content_rewrite`

### Interface Layer
- `app/page.tsx`
- `InputPanel`
- `InsightPanel`
- `OutputPanel`

## Capability Files
- [sourceInputResolver.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/sourceInputResolver.ts)
- [redditSourceFetcher.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/redditSourceFetcher.ts)
- [manualSourceBuilder.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/manualSourceBuilder.ts)
- [sourceMaterialNormalizer.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/sourceMaterialNormalizer.ts)
- [problemAnalysisEngine.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/problemAnalysisEngine.ts)
- [radarRecordBuilder.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/radarRecordBuilder.ts)
- [insightDraftBuilder.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/insightDraftBuilder.ts)
- [radarRecordSearcher.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/radarRecordSearcher.ts)
- [radarRecordMapper.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/radarRecordMapper.ts)
- [radarRecordUpsertor.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/radarRecordUpsertor.ts)
- [contentGenerationEngine.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/contentGenerationEngine.ts)
- [contentRewriteEngine.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/contentRewriteEngine.ts)
- [outputBundleManager.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/outputBundleManager.ts)
- [registry.ts](c:/code/AIproduct/00%20Problem%20Radar/capabilities/registry.ts)

## Protocol Files
- [capabilityInvoker.ts](c:/code/AIproduct/00%20Problem%20Radar/protocol/capabilityInvoker.ts)
- [radarProtocol.ts](c:/code/AIproduct/00%20Problem%20Radar/protocol/radarProtocol.ts)
- [workspaceInvoker.ts](c:/code/AIproduct/00%20Problem%20Radar/protocol/workspaceInvoker.ts)
- [registry.ts](c:/code/AIproduct/00%20Problem%20Radar/protocol/registry.ts)
- [protocol.ts](c:/code/AIproduct/00%20Problem%20Radar/types/protocol.ts)

## API Routes
- [route.ts](c:/code/AIproduct/00%20Problem%20Radar/app/api/capabilities/%5Bname%5D/route.ts)
- [route.ts](c:/code/AIproduct/00%20Problem%20Radar/app/api/protocol/%5Bname%5D/route.ts)
- [route.ts](c:/code/AIproduct/00%20Problem%20Radar/app/api/registry/route.ts)

## Compatibility Routes
- [route.ts](c:/code/AIproduct/00%20Problem%20Radar/app/api/analyze/route.ts)
- [route.ts](c:/code/AIproduct/00%20Problem%20Radar/app/api/radar/route.ts)
- [route.ts](c:/code/AIproduct/00%20Problem%20Radar/app/api/generate/route.ts)
- [route.ts](c:/code/AIproduct/00%20Problem%20Radar/app/api/rewrite/route.ts)
- [route.ts](c:/code/AIproduct/00%20Problem%20Radar/app/api/reddit/route.ts)

## Call Flow

### Preferred Flow
- UI or agent calls protocol route
- protocol composes capability modules
- structured response returns workspace state

### Capability Flow
- api or agent calls capability by name
- invoker resolves capability
- structured response returns one capability result

### Interface Rule
- no source resolution logic in ui
- no analysis logic in ui
- no radar save logic in ui
- no content rewrite mapping in ui
- no content generation logic in ui
- ui only:
  - collect input
  - display state
  - trigger protocol
