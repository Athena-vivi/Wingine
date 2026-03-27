import { assemblePostToChannelContentResponse } from "../response/postToChannelContentResponse.ts"
import { transformPostToChannelContentRequest } from "../transform/postToChannelContentTransform.ts"
import { runPostToChannelContentWorkflow } from "../../workflows/postToChannelContent/postToChannelContentWorkflow.ts"
import type {
  PostToChannelContentInput,
  PostToChannelContentResult
} from "../../contracts/usecases/postToChannelContent.ts"

export async function handlePostToChannelContentBoundary(
  input: PostToChannelContentInput
): Promise<PostToChannelContentResult> {
  const problem = transformPostToChannelContentRequest(input)
  const result = await runPostToChannelContentWorkflow({
    request: input,
    problem
  })

  return assemblePostToChannelContentResponse(result)
}
