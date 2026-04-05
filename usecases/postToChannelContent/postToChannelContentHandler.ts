import { handlePostToChannelContentBoundary } from "../../src/boundary/entry/postToChannelContentEntry.ts"
export type {
  PostToChannelContentInput,
  PostToChannelContentResult
} from "../../src/contracts/usecases/postToChannelContent.ts"
import type {
  PostToChannelContentInput,
  PostToChannelContentResult
} from "../../src/contracts/usecases/postToChannelContent.ts"

export async function postToChannelContentHandler(
  input: PostToChannelContentInput
): Promise<PostToChannelContentResult> {
  return handlePostToChannelContentBoundary(input)
}


