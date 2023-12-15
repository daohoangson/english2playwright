import {
  CreateChatCompletionInput,
  MessageContent,
  Messages,
  createChatCompletion,
} from "./src/openai";
import { snapshot, screenshot } from "./src/playwright";
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
const model: CreateChatCompletionInput["model"] = "gpt-4-1106-preview";
const isVisionModel = model === "gpt-4-vision-preview";

async function prompt(messages: Messages): Promise<string> {
  prompts.log({ examples, messages, requirement });
  const assistant = await createChatCompletion({
    messages,
    model,
    max_tokens: 1024,
    temperature: 0.2,
  });

  const match = assistant.match(/```javascript([\s\S]*?)```/);
  if (match !== null) {
    console.log(`assistant: ${assistant}`);
    return match[1].trim();
  }

  console.warn(`Could not find any JavaScript: ${assistant}`);
  process.exit(0);
}

(async function main() {
  let checkpointMessages: Messages = [];
  let checkpointScript = prompts.initialScript;
  let messages: Messages = [];

  function updateCheckpoint(
    newScript: string,
    {
      snapshotData,
      screenshotData,
    }: {
      snapshotData?: Awaited<ReturnType<typeof snapshot>>;
      screenshotData?: Awaited<ReturnType<typeof screenshot>>;
    } = {}
  ) {
    checkpointMessages = [];
    checkpointScript = newScript;
    const hasSnapshot = typeof snapshotData === "object";
    const hasScreenshot = typeof screenshotData === "object";

    const content: MessageContent = [
      {
        type: "text",
        text: `${character}\n\nRequirement: ${requirement}\n\n\`\`\`javascript\n${checkpointScript}\n${prompts.cleanUpScript}\n\`\`\``,
      },
    ];
    if (!hasSnapshot && !hasScreenshot) {
      checkpointMessages.push(...examples); // needed for first prompt
    } else {
      if (hasSnapshot) {
        content.push({
          type: "text",
          text: `HTML:\n\n${snapshotData.html}`,
        });
      }
      if (hasScreenshot) {
        content.push({
          type: "image_url",
          image_url: { url: screenshotData.dataUri },
        });
      }
    }

    checkpointMessages.push({ role: "user", content });
    messages = [...checkpointMessages];
  }

  let loop = 0;
  while (true) {
    console.log(`\n\nLoop number: ${++loop}`);
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
      const snapshotData = isVisionModel
        ? undefined
        : await snapshot(newScript);
      const screenshotData = isVisionModel
        ? await screenshot(newScript)
        : undefined;
      updateCheckpoint(newScript, { snapshotData, screenshotData }); // success 🎉
    } catch (screenshotError) {
      messages.push({
        role: "user",
        content: JSON.stringify({ error: screenshotError.message }),
      });
    }
  }
})();
