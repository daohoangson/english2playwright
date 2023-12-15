import * as fs from "fs";
import OpenAI from "openai";
import { mockChatCompletion } from "./openai.mocks";

let ltdCount = 0;
let ltdCost = 0.0;
let openai: OpenAI | undefined;

export type MessageContent =
  OpenAI.Chat.Completions.ChatCompletionContentPart[];
export type Messages = OpenAI.Chat.Completions.ChatCompletionMessageParam[];
export type CreateChatCompletionInput =
  OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

export async function createChatCompletion(
  body: CreateChatCompletionInput
): Promise<string> {
  fs.appendFileSync("openai.json", JSON.stringify({ body }) + "\n");
  const apiKey = process.env.OPENAI_API_KEY ?? "";
  if (apiKey === "") {
    const mocked = mockChatCompletion(body);
    if (typeof mocked !== "undefined") {
      return mocked.choices[0].message.content!;
    }
  }

  if (typeof openai === "undefined") {
    if (apiKey.length === 0) {
      console.error("OPENAI_API_KEY is not set");
      process.exit(1);
    }
    openai = new OpenAI({ apiKey });
  }

  console.log(`assistant: Generating...`);
  const completion = await openai!.chat.completions.create(body);
  fs.appendFileSync("openai.json", JSON.stringify({ completion }) + "\n");
  trackCost(completion);

  return completion.choices[0].message.content ?? "🤷";
}

function trackCost({ usage }: OpenAI.Chat.Completions.ChatCompletion) {
  const promptCost = ((usage?.prompt_tokens ?? 0) / 1000) * 0.01; // $0.01 / 1K tokens
  const completionCost = ((usage?.completion_tokens ?? 0) / 1000) * 0.03; // $0.03 / 1K tokens
  ltdCount++;
  ltdCost += promptCost + completionCost;
  console.log({ ltdCount, ltdCost });
}
