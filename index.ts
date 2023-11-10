import OpenAI from "openai";
import { trackCost } from "./src/cost";
import { screenshot } from "./src/playwright";
import * as prompts from "./src/prompts";

const requirement = (process.argv[process.argv.length - 1] ?? "").trim();
if (!requirement.startsWith("Write test script to")) {
  process.exit(1);
}

const character = `You are a professional automation quality engineer.
You read requirement and write Playwright in JavaScript to automate the test.

You write one Playwright command at a time, a screenshot will be provided after executing that command.
Each element will be highlighted with a black box and its id, class attributes.
For other elements, prefer text-based selector like \`await page.click("text='Button text'");\` to improve the stability of the script.
Some website uses custom date or number picker, you should trigger the custom picker then click the buttons instead of filling textual value directly.
You write one Playwright command at a time.`;

const examples = prompts.generateExample(character);
const openai = new OpenAI();
async function prompt(messages: prompts.Messages): Promise<string> {
  prompts.log({ examples, messages, requirement });
  const { choices, usage } = await openai.chat.completions.create({
    messages,
    model: "gpt-4-vision-preview",
    max_tokens: 1024,
    temperature: 0.2,
  });
  trackCost(usage);

  const reply = choices[0].message.content ?? "🤷";
  const match = reply.match(/```javascript([\s\S]*?)```/);
  if (match !== null) {
    console.log(reply);
    return match[1].trim();
  }
  console.warn(`Could not find any JavaScript in reply: ${reply}`);
  process.exit(0);
}

(async function main() {
  let checkpointMessages: prompts.Messages = [];
  let checkpointScript = prompts.initialScript;
  let messages: prompts.Messages = [];

  function updateCheckpoint(newScript: string, screenshotUrl?: string) {
    checkpointMessages = [];
    checkpointScript = newScript;
    const hasScreenshot = typeof screenshotUrl === "string";

    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `${character}\n\nRequirement: ${requirement}\n\n\`\`\`javascript\n${checkpointScript}\n${prompts.cleanUpScript}\n\`\`\``,
      },
    ];
    if (!hasScreenshot) {
      checkpointMessages.push(...examples); // needed for first prompt
    } else {
      content.push({
        type: "image_url",
        image_url: { url: screenshotUrl },
      });
    }

    checkpointMessages.push({ role: "user", content });
    messages = [...checkpointMessages];
  }

  let loop = 0;
  while (true) {
    console.log(`Loop number: ${++loop}`);
    if (loop === 1) {
      updateCheckpoint(prompts.initialScript);
    }

    const line = await prompt(messages);
    messages.push({
      role: "assistant",
      content: `\`\`\`javascript\n${line}\n\`\`\``, // for retry, self healing
    });

    try {
      const newScript = `${checkpointScript}\n  ${line}`;
      const screenshotUrl = await screenshot(newScript);
      updateCheckpoint(newScript, screenshotUrl); // success 🎉
    } catch (error) {
      messages.push({ role: "user", content: JSON.stringify({ error }) });
    }
  }
})();
