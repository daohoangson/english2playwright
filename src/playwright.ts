import * as fs from "fs";
import { cleanUpScript } from "./prompts";

const scriptToHighlight =
  "await page.evaluate(\"document.querySelectorAll('*').forEach((e) => { if (!e.id && !e.className) return; const rect = e.getBoundingClientRect(); const left = rect.left + window.scrollX; const top = rect.top + window.scrollY; const div = document.createElement('div'); div.innerText = ''; if (e.id) div.innerText += ` id=${e.id}`; if (e.className) div.innerText += ` class=${e.className}`; div.style = `background: black; color: white; font-size: 12px; position: absolute; top: ${top-12}px; left: ${left-6}px`; document.getElementsByTagName('body')[0].appendChild(div); });\");";

export async function screenshot(script: string): Promise<string> {
  const ngrokUrl = process.env.NGROK_URL ?? "";
  if (ngrokUrl.length === 0) {
    console.error("NGROK_URL is not set");
    process.exit(1);
  }

  const relativePath = `screenshots/screenshot-${Date.now()}.png`;
  const scriptToScreenshot = `await page.screenshot({ path: './${relativePath}' });`;

  const evalScript = `${script};\n${scriptToHighlight}\n${scriptToScreenshot}\n${cleanUpScript}`;
  fs.writeFileSync("output.js", `${script}\n${cleanUpScript}`);
  console.log(`playwright: Taking screenshot...`);
  await eval(evalScript);

  return `${ngrokUrl}/${relativePath}`;
}
