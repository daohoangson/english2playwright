import OpenAI from "openai";

let ltdCount = 0;
let ltdCost = 0.0;

export function trackCost(
  usage: OpenAI.Completions.CompletionUsage | undefined
) {
  const promptCost = ((usage?.prompt_tokens ?? 0) / 1000) * 0.01; // $0.01 / 1K tokens
  const completionCost = ((usage?.completion_tokens ?? 0) / 1000) * 0.03; // $0.03 / 1K tokens
  ltdCount++;
  ltdCost += promptCost + completionCost;
  console.log({ usage, ltdCount, ltdCost });
}
