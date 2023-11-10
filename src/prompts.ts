import { Messages } from "./openai";

export const initialScript = `const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: false });
  const page = await browser.newPage({ screen: { width: 600, height: 400 } });`;

// use try catch because AI may generate the close command by itself
export const cleanUpScript = `

try { await browser.close(); } catch (e) { }
})();`;

export function generateExample(character: string): Messages {
  return [
    {
      role: "user",
      content: `${character}\n\nRequirement: Write test script to open website https://playwright.dev`,
    },
    {
      role: "assistant",
      content: '```javascript\nawait page.goto("https://playwright.dev");\n```',
    },
  ];
}

export function log({
  examples,
  messages,
  requirement,
}: {
  examples: Messages;
  messages: Messages;
  requirement: string;
}) {
  console.log(
    messages
      .filter((m) => m !== examples[0] && m !== examples[1])
      .map((m) => {
        const content = m.content;
        if (Array.isArray(content)) {
          return content
            .map((c) => {
              const { type } = c;
              switch (type) {
                case "text":
                  let { text } = c;
                  if (m.role === "user" && text.includes(requirement)) {
                    text = requirement;
                  }
                  return `${m.role}: ${text.trim()}`;
                case "image_url":
                  return `${m.role}: ${type}`;
              }
            })
            .join("\n");
        } else {
          return `${m.role}: ${content}`;
        }
      })
      .join("\n")
  );
}
