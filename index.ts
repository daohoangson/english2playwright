import fs from "fs";
import {
  CreateChatCompletionInput,
  Messages,
  createChatCompletion,
} from "./src/openai";
import { executeFn, functions } from "./src/openai_functions";
import * as prompts from "./src/prompts";

const requirement = (process.argv[process.argv.length - 1] ?? "").trim();
if (!requirement.startsWith("Write test script to")) {
  process.exit(1);
}

const character = `You are a professional automation quality engineer.
You read requirement and write test script in JavaScript, using Playwright to automate testing.

Do it step by step:
- Explore the application under testing to understand its layout and elements
- Explain yourself as you are exploring the AUT
- Update the test script to save your progress frequently
- Inform the user when the test script is updated so they can verify it

`;

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

  checkpointMessages.push({ role: "system", content: character });
  checkpointMessages.push({
    role: "user",
    content: [
      {
        type: "text",
        text:
          `Requirement: ${requirement}\n\n` +
          "```javascript\n" +
          checkpointScript +
          "\n```",
      },
    ],
  });

  function updateCheckpoint(newScript: string) {
    const diff = newScript.replace(checkpointScript, "");
    if (diff.length > 0) {
      checkpointScript = newScript;
      checkpointMessages.push({
        role: "assistant",
        content: "Execute this:\n\n```javascript\n" + diff + "\n```",
      });
    }

    messages = [...checkpointMessages];
  }

  let loop = 0;
  while (true) {
    console.log(`\n\nLoop number: ${++loop}`);
    if (loop === 1) {
      updateCheckpoint(prompts.initialScript);
    } else {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        const snapshotFunction = functions.find((f) => f.name === "snapshot");
        if (typeof snapshotFunction === "undefined") {
          throw new Error("Could not find snapshot function");
        }

        // @ts-ignore
        const snapshotResult = await snapshotFunction.function(null, null);
        messages.push({
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Look good, continue exploring from here:\n\nSnapshot:\n\n" +
                JSON.stringify(snapshotResult),
            },
          ],
        });
      }
    }

    const line = await prompt(messages);
    messages.push({
      role: "assistant",
      content: "Try this:\n\n```javascript\n" + line + "\n```",
    });

    const newScript = `${checkpointScript}\n  ${line}`;
    const result = await executeFn<{}>(async (page) => {
      fs.writeFileSync("output.js", newScript);

      const AsyncFunction = async function () {}.constructor;
      const fnBody = newScript.replace(prompts.initialScript, "");
      const fn = AsyncFunction("page", fnBody);
      await fn(page);
      return { success: true };
    }, {});
    if (result.success) {
      updateCheckpoint(newScript); // success 🎉
    } else {
      messages.push({
        role: "user",
        content: JSON.stringify(result),
      });
    }
  }
})();
