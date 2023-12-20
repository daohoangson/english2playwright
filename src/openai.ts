import * as fs from "fs";
import OpenAI from "openai";
import { ChatCompletionFunctionRunnerParams } from "openai/resources/beta/chat/completions";
import {
  closeGlobalBrowser,
  functions,
  globalTestScriptLines,
} from "./openai_functions";

let ltdCount = 0;
let ltdCost = 0.0;

const apiKey = process.env.OPENAI_API_KEY ?? "";
let openai = new OpenAI({ apiKey });

export type MessageContent =
  OpenAI.Chat.Completions.ChatCompletionContentPart[];
export type Messages = OpenAI.Chat.Completions.ChatCompletionMessageParam[];

type RunFunctionsInput = ChatCompletionFunctionRunnerParams<any>;
export type CreateChatCompletionInput = Omit<RunFunctionsInput, "functions">;

export async function createChatCompletion(
  body: CreateChatCompletionInput
): Promise<string> {
  fs.appendFileSync("openai.json", JSON.stringify({ body }) + "\n");

  console.log(`assistant: Generating...`);

  globalTestScriptLines.length = 0;

  const runner = openai.beta.chat.completions.runFunctions({
    ...body,
    functions,
  });

  runner.on("chatCompletion", (chatCompletion) => {
    fs.appendFileSync("openai.json", JSON.stringify({ chatCompletion }) + "\n");
    trackCost(chatCompletion);
  });
  // runner.on("functionCall", (functionCall) =>
  //   fs.appendFileSync("openai.json", JSON.stringify({ functionCall }) + "\n")
  // );
  runner.on("functionCallResult", (functionCallResult) =>
    fs.appendFileSync(
      "openai.json",
      JSON.stringify({ functionCallResult }) + "\n"
    )
  );
  // runner.on("message", (message) =>
  //   fs.appendFileSync("openai.json", JSON.stringify({ message }) + "\n")
  // );

  await runner.done();
  await closeGlobalBrowser();

  const lines = globalTestScriptLines.join("\n").trim();
  if (lines.length === 0) {
    return lines;
  }

  return "```javascript\n" + lines + "\n```";
}

function trackCost({ usage }: OpenAI.Chat.Completions.ChatCompletion) {
  const promptCost = ((usage?.prompt_tokens ?? 0) / 1000) * 0.01; // $0.01 / 1K tokens
  const completionCost = ((usage?.completion_tokens ?? 0) / 1000) * 0.03; // $0.03 / 1K tokens
  ltdCount++;
  ltdCost += promptCost + completionCost;
  console.log({ ltdCount, ltdCost });
}
