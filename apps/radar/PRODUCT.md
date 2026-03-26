# Problem Radar

## Goal
- Turn source material into structured problem insight.
- Keep one fixed chain:
  - `Source -> Analysis -> Radar Record -> Save -> Content -> Rewrite`
- Support:
  - human workspace use
  - agent invocation
  - api invocation

## Core Rules
- Business logic lives in capability modules.
- Protocol is the system call surface.
- UI only collects input, shows state, and triggers protocol.
- Radar record remains the structured system asset.

## Current Architecture
- `Capability Layer`
- `Protocol Layer`
- `Interface Layer`

## Current Capability Groups
- `Source Intake`
- `Analysis`
- `Radar Record`
- `Content`

## Current Status
- source intake extracted into capability modules
- analysis and radar build extracted into capability modules
- radar save extracted into capability modules
- content generation and rewrite extracted into capability modules
- capability registry added
- protocol registry added
- capability api and protocol api added
- page switched to protocol-first flow

## Main Callable Entry
- `POST /api/protocol/source_analyze`
- `POST /api/protocol/radar_save`
- `POST /api/protocol/content_generate`
- `POST /api/protocol/content_rewrite`
- `GET /api/registry`

## Notes
- legacy routes remain available as compatibility entry points
- protocol routes are the preferred callable surface
