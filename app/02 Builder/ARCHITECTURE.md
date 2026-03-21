# Builder Architecture

## Layers

### Capability Layer
- `builder_record_manager`
- `workflow_manager`
- `workflow_step_linker`
- `capability_attachment_manager`
- `capability_detail_resolver`
- `output_manager`
- `ui_template_manager`

### Protocol Layer
- `builder_load`
- `workflow_update`
- `workflow_link_update`
- `capability_attachment_update`
- `output_update`
- `builder_persist`

### Interface Layer
- `BuilderConsole`
- `ProblemInfoPanel`
- `WorkflowPanel`
- `CapabilitiesPanel`
- `OutputPanel`

## Capability Files
- [builderRecordManager.ts](c:/code/AIproduct/01%20Builder/capabilities/builderRecordManager.ts)
- [workflowManager.ts](c:/code/AIproduct/01%20Builder/capabilities/workflowManager.ts)
- [workflowStepLinker.ts](c:/code/AIproduct/01%20Builder/capabilities/workflowStepLinker.ts)
- [capabilityAttachmentManager.ts](c:/code/AIproduct/01%20Builder/capabilities/capabilityAttachmentManager.ts)
- [capabilityDetailResolver.ts](c:/code/AIproduct/01%20Builder/capabilities/capabilityDetailResolver.ts)
- [outputManager.ts](c:/code/AIproduct/01%20Builder/capabilities/outputManager.ts)
- [uiTemplateManager.ts](c:/code/AIproduct/01%20Builder/capabilities/uiTemplateManager.ts)
- [registry.ts](c:/code/AIproduct/01%20Builder/capabilities/registry.ts)

## Protocol Files
- [capabilityInvoker.ts](c:/code/AIproduct/01%20Builder/protocol/capabilityInvoker.ts)
- [builderProtocol.ts](c:/code/AIproduct/01%20Builder/protocol/builderProtocol.ts)
- [workspaceInvoker.ts](c:/code/AIproduct/01%20Builder/protocol/workspaceInvoker.ts)
- [registry.ts](c:/code/AIproduct/01%20Builder/protocol/registry.ts)
- [protocol.ts](c:/code/AIproduct/01%20Builder/types/protocol.ts)

## API Routes
- [route.ts](c:/code/AIproduct/01%20Builder/app/api/capabilities/%5Bname%5D/route.ts)
- [route.ts](c:/code/AIproduct/01%20Builder/app/api/protocol/%5Bname%5D/route.ts)
- [route.ts](c:/code/AIproduct/01%20Builder/app/api/registry/route.ts)

## Call Flow

### Human UI
- interface event
- protocol request
- capability or composite protocol
- structured response
- ui render

### Agent
- invoke protocol or capability by name
- receive structured state and payload

### API
- `POST /api/capabilities/[name]`
- `POST /api/protocol/[name]`
- `GET /api/registry`

## Current Interface Rule
- no workflow mutation logic in ui
- no capability resolution logic in ui
- no output update logic in ui
- no template resolution logic in ui
- ui only:
  - collect input
  - display state
  - trigger protocol
