import * as fs from "fs";
import Jimp from "jimp";
import { cleanUpScript } from "./prompts";

const scriptToHighlight =
  "await page.evaluate(\"document.querySelectorAll('*').forEach((e) => { if (!e.id && !e.className) return; const rect = e.getBoundingClientRect(); const left = rect.left + window.scrollX; const top = rect.top + window.scrollY; const div = document.createElement('div'); div.innerText = ''; if (e.id) div.innerText += ` id=${e.id}`; if (e.className) div.innerText += ` class=${e.className}`; div.style = `background: black; color: white; font-size: 12px; position: absolute; top: ${top-12}px; left: ${left-6}px`; document.getElementsByTagName('body')[0].appendChild(div); });\");";

export async function screenshot(script: string): Promise<string> {
  const now = Date.now();
  const jpegPath = `screenshots/${now}.jpeg`;
  const pngPath = `screenshots/${now}.png`;
  const scriptToScreenshot = `await page.screenshot({ path: './${pngPath}' });`;

  const evalScript = `${script};\n${scriptToHighlight}\n${scriptToScreenshot}\n${cleanUpScript}`;
  fs.writeFileSync("output.js", `${script}\n${cleanUpScript}`);
  console.log(`playwright: Taking ${pngPath}...`);
  await eval(evalScript);

  let bufferPath = pngPath;
  const pngStat = fs.statSync(pngPath);
  if (pngStat.size > 500000) {
    // PNG file size is >500KB, most likely because of some raster image
    console.log(`playwright: Writing ${jpegPath}...`);
    const jimp = await Jimp.read(pngPath);
    await jimp.quality(60).writeAsync(jpegPath);
    bufferPath = jpegPath;
  }

  const buffer = fs.readFileSync(bufferPath);
  const base64 = buffer.toString("base64");
  const mimeType = `image/${bufferPath === pngPath ? "png" : "jpeg"}`;
  return `data:image/${mimeType};base64,${base64}`;
}
