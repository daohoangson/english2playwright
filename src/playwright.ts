import * as fs from "fs";
import Jimp from "jimp";
import { cleanUpScript } from "./prompts";
import { Page } from "playwright";

async function highlight(page: Page) {
  const highlightInner = () => {
    document.querySelectorAll("a,button,input").forEach((e) => {
      const attrs = e.attributes;
      const attrPairsP1: string[] = [];
      const attrPairsP2: string[] = [];
      const attrPairsP3: string[] = [];
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        const attrName = attr.name.trim();
        const attrValue = attr.value.trim();
        if (attrName.length === 0 || attrValue.length === 0) continue;

        switch (attrName) {
          case "id":
            attrPairsP1.push(`${attrName}=${attrValue}`);
            break;
          case "aria-label":
          case "title":
            if (attrPairsP2.length === 0) {
              if (attrValue !== (e as HTMLElement).innerText) {
                attrPairsP2.push(`${attrName}=${attrValue}`);
              }
            }
            break;
          case "class":
            attrPairsP3.push(`${attrName}=${attrValue}`);
            break;
        }
      }

      const attrPairs: string[] = [];
      if (attrPairsP1.length > 0) {
        attrPairs.push(...attrPairsP1);
      } else if (attrPairsP2.length > 0) {
        attrPairs.push(...attrPairsP2);
      } else {
        attrPairs.push(...attrPairsP3);
      }
      if (attrPairs.length === 0) return;

      const rect = e.getBoundingClientRect();
      const left = rect.left + window.scrollX;
      const top = rect.top + window.scrollY;

      const div = document.createElement("div");
      div.innerText = attrPairs.join(" ");
      div.style.cssText = `
        background: black;
        color: white;
        font-size: 12px;
        position: absolute;
        top: ${top - 12}px;
        left: ${left - 6}px;
        z-index: 2147483647;
      `;
      document.getElementsByTagName("body")[0].appendChild(div);
    });
  };

  await page.evaluate(`(${highlightInner.toString()})();`);
}

const scriptToHighlight = `(${highlight.toString()})(page);`;

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
