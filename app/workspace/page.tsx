import { SystemBuilderWorkspace } from "../../src/system-builder/ui/SystemBuilderWorkspace.js"
import type { ActiveSpace } from "../../src/system-builder/types.js"

type WorkspacePageProps = {
  searchParams?: Promise<{
    projectId?: string
    space?: string
  }>
}

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const params = (await searchParams) ?? {}
  const initialSpace: ActiveSpace =
    params.space === "problem-radar" ? "problem-radar" : "builder-space"

  return (
    <SystemBuilderWorkspace
      initialProjectId={params.projectId}
      initialSpace={initialSpace}
    />
  )
}
