import OpenAI from "openai";

const prefix =
  "You are a professional automation quality engineer.\nYou read requirement and write Playwright in JavaScript to automate the test.\n\nYou write one Playwright command at a time, a screenshot will be provided after executing that command.\nEach element will be highlighted with a black box and its id, class attributes.\nFor other elements, prefer text-based selector like `await page.click(\"text='Button text'\");` to improve the stability of the script.\nSome website uses custom date or number picker, you should trigger the custom picker then click the buttons instead of filling textual value directly.\nYou write one Playwright command at a time.\n\nRequirement: Write test script to make appointment on website https://katalon-demo-cura.herokuapp.com\n\n```javascript\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ channel: \"chrome\" });\n  const page = await browser.newPage({ screen: { width: 600, height: 400 } });\n";
const suffix = "\n\ntry { await browser.close(); } catch (e) { }\n})();\n```";

const mockedChatCompletions: {
  request: string;
  response: OpenAI.Chat.Completions.ChatCompletion;
}[] = [
  {
    request: `${prefix}${suffix}`,
    response: mockAssistant(
      "To begin the test script for making an appointment on the website https://katalon-demo-cura.herokuapp.com, we first need to navigate to the website:\n\n```javascript\n" +
        'await page.goto("https://katalon-demo-cura.herokuapp.com");\n' +
        "```",
      { prompt_tokens: 372, completion_tokens: 51, total_tokens: 423 }
    ),
  },
  {
    request:
      prefix +
      '  await page.goto("https://katalon-demo-cura.herokuapp.com");\n' +
      suffix,
    response: mockAssistant(
      'Based on the requirement and the screenshot provided, the first step in the test script would be to click on the "Make Appointment" button. Here is the Playwright command to perform this action:\n\n```javascript\n' +
        "await page.click('#btn-make-appointment');\n" +
        "```\n\nPlease provide the next screenshot after executing this command.",
      { prompt_tokens: 1336, completion_tokens: 63, total_tokens: 1399 }
    ),
  },
  {
    request:
      prefix +
      '  await page.goto("https://katalon-demo-cura.herokuapp.com");\n' +
      "  await page.click('#btn-make-appointment');\n" +
      suffix,
    response: mockAssistant(
      "Based on the screenshot provided, it looks like we are on the login page of the website. The next step in the test script would be to fill in the username and password fields and then click the login button. Since the demo account credentials are provided on the page, we can use those for the test.\n\nHere's the next part of the Playwright script:\n\n```javascript\n" +
        "// Fill in the username\n" +
        "await page.fill('#txt-username', 'John Doe');\n\n" +
        "// Fill in the password\n" +
        "await page.fill('#txt-password', 'ThisIsNotAPassword');\n\n" +
        "// Click the login button\n" +
        "await page.click('#btn-login');\n" +
        "```\n\nPlease provide the next screenshot after executing these commands.",
      { prompt_tokens: 1346, completion_tokens: 139, total_tokens: 1485 }
    ),
  },
  {
    request:
      prefix +
      '  await page.goto("https://katalon-demo-cura.herokuapp.com");\n' +
      "  await page.click('#btn-make-appointment');\n" +
      "  // Fill in the username\n" +
      "await page.fill('#txt-username', 'John Doe');\n\n" +
      "// Fill in the password\n" +
      "await page.fill('#txt-password', 'ThisIsNotAPassword');\n\n" +
      "// Click the login button\n" +
      "await page.click('#btn-login');\n" +
      suffix,
    response: mockAssistant(
      "Based on the screenshot provided, the next step in the Playwright script would be to select a facility from the dropdown menu. Here's the Playwright command to select the first facility option:\n\n```javascript\n" +
        "await page.selectOption('.form-group .form-control', 'Hongkong CURA Healthcare Center');\n" +
        "```\n\nPlease execute this command and provide the next screenshot.",
      { prompt_tokens: 1398, completion_tokens: 73, total_tokens: 1471 }
    ),
  },

  {
    request:
      prefix +
      '  await page.goto("https://katalon-demo-cura.herokuapp.com");\n' +
      "  await page.click('#btn-make-appointment');\n" +
      "  // Fill in the username\n" +
      "await page.fill('#txt-username', 'John Doe');\n\n" +
      "// Fill in the password\n" +
      "await page.fill('#txt-password', 'ThisIsNotAPassword');\n\n" +
      "// Click the login button\n" +
      "await page.click('#btn-login');\n" +
      "  await page.selectOption('.form-group .form-control', 'Hongkong CURA Healthcare Center');\n" +
      suffix,
    response: mockAssistant(
      `Based on the screenshot provided, the next step in the automation script would be to select a healthcare program. Since the radio buttons are visible in the screenshot, you can use the IDs provided to select one of the options. Let's choose the "Medicaid" program for this example.\n\nHere's the Playwright command to select the "Medicaid" radio button:\n\n` +
        "```javascript\n" +
        "await page.click('#radio_program_medicaid');\n" +
        "```\n\nPlease execute this command and provide the next screenshot.",
      { prompt_tokens: 1419, completion_tokens: 97, total_tokens: 1516 }
    ),
  },
  {
    request:
      prefix +
      '  await page.goto("https://katalon-demo-cura.herokuapp.com");\n' +
      "  await page.click('#btn-make-appointment');\n" +
      "  // Fill in the username\n" +
      "await page.fill('#txt-username', 'John Doe');\n\n" +
      "// Fill in the password\n" +
      "await page.fill('#txt-password', 'ThisIsNotAPassword');\n\n" +
      "// Click the login button\n" +
      "await page.click('#btn-login');\n" +
      "  await page.selectOption('.form-group .form-control', 'Hongkong CURA Healthcare Center');\n" +
      "  await page.click('#radio_program_medicaid');\n" +
      suffix,
    response: mockAssistant(
      "The next step in the script is to interact with the date picker to select a visit date. Since the website uses a custom date picker, we should trigger it and then click the buttons to set the date. Let's open the date picker first.\n\nPlease add the following command to the script to click on the calendar icon and open the date picker:\n\n```javascript\n" +
        "await page.click('.glyphicon-calendar');\n" +
        "```\n\nExecute this command, and then provide the screenshot of the date picker that appears.",
      { prompt_tokens: 1429, completion_tokens: 98, total_tokens: 1527 }
    ),
  },
  {
    request:
      prefix +
      '  await page.goto("https://katalon-demo-cura.herokuapp.com");\n' +
      "  await page.click('#btn-make-appointment');\n" +
      "  // Fill in the username\n" +
      "await page.fill('#txt-username', 'John Doe');\n\n" +
      "// Fill in the password\n" +
      "await page.fill('#txt-password', 'ThisIsNotAPassword');\n\n" +
      "// Click the login button\n" +
      "await page.click('#btn-login');\n" +
      "  await page.selectOption('.form-group .form-control', 'Hongkong CURA Healthcare Center');\n" +
      "  await page.click('#radio_program_medicaid');\n" +
      "  await page.click('.glyphicon-calendar');\n" +
      suffix,
    response: mockAssistant(
      "Based on the screenshot provided, it looks like the date picker is open. To continue with the automation script, you would select a date from the date picker. Since I cannot interact with the screenshot, I will provide you with the next Playwright command that would typically be used to select a date. You would replace 'DATE_SELECTOR' with the actual selector for the date you want to select.\n\n```javascript\n" +
        "// Select a date from the date picker\n" +
        "await page.click('DATE_SELECTOR');\n" +
        "```\n\nPlease replace 'DATE_SELECTOR' with the appropriate selector for the date you want to choose, such as `text='15'` if you want to select the 15th of the month displayed in the date picker. If you provide the next screenshot after executing this command, I can continue to assist with the next steps.",
      { prompt_tokens: 1437, completion_tokens: 165, total_tokens: 1602 }
    ),
  },
  {
    request: JSON.stringify({
      error:
        "page.click: Timeout 30000ms exceeded.\n=========================== logs ===========================\nwaiting for locator('DATE_SELECTOR')\n============================================================",
    }),
    response: mockAssistant(
      "It seems there was an error with the date selector. Let's try selecting a specific date from the date picker using a more appropriate selector. Since the screenshot shows the calendar open and we need to select a date, we'll use the text-based selector to click on a specific date. Let's choose November 20, 2023, for the appointment.\n\n```javascript\n" +
        "// Click on a specific date in the date picker\n" +
        `await page.click("text='20'");\n` +
        "```",
      { prompt_tokens: 1498, completion_tokens: 95, total_tokens: 1593 }
    ),
  },
  {
    request:
      prefix +
      '  await page.goto("https://katalon-demo-cura.herokuapp.com");\n' +
      "  await page.click('#btn-make-appointment');\n" +
      "  // Fill in the username\n" +
      "await page.fill('#txt-username', 'John Doe');\n\n" +
      "// Fill in the password\n" +
      "await page.fill('#txt-password', 'ThisIsNotAPassword');\n\n" +
      "// Click the login button\n" +
      "await page.click('#btn-login');\n" +
      "  await page.selectOption('.form-group .form-control', 'Hongkong CURA Healthcare Center');\n" +
      "  await page.click('#radio_program_medicaid');\n" +
      "  await page.click('.glyphicon-calendar');\n" +
      "  // Click on a specific date in the date picker\n" +
      `await page.click("text='20'");\n` +
      suffix,
    response: mockAssistant(
      "The next step in the script would be to fill in the comment section. Since the comment box is highlighted with a black box and its class attribute is visible, you can use the class selector to target the comment input.\n\nAdd the following Playwright command to fill in the comment:\n\n```javascript\n" +
        "// Fill in the comment section\n" +
        "await page.fill('.form-control', 'This is a test comment.');\n" +
        "```\n\n" +
        'After this command, you would typically want to submit the appointment form by clicking the "Book Appointment" button. The button has the id `btn-book-appointment`, so you can use that to target the button.\n\n```javascript\n' +
        "// Click the 'Book Appointment' button\n" +
        "await page.click('#btn-book-appointment');\n" +
        "```\n\nThis would complete the process of making an appointment on the website.",
      { prompt_tokens: 1458, completion_tokens: 161, total_tokens: 1619 }
    ),
  },
  {
    request: JSON.stringify({
      error:
        'page.fill: Error: Element is not an <input>, <textarea> or [contenteditable] element\n=========================== logs ===========================\nwaiting for locator(\'.form-control\')\n  locator resolved to 3 elements. Proceeding with the first one: <select name="facility" id="combo_facility" class="form-…>…</select>\nelementHandle.fill("This is a test comment.")\n  waiting for element to be visible, enabled and editable\n  Element is not an <input>, <textarea> or [contenteditable] element\n============================================================',
    }),
    response: mockAssistant(
      "It seems there are multiple elements with the class `.form-control`, and the first one encountered is not an input, textarea, or contenteditable element. To target the comment input specifically, we should use a more precise selector. Let's try selecting the comment input by its id attribute.\n\n```javascript\n" +
        "// Fill in the comment section using the id of the textarea\n" +
        "await page.fill('#txt_comment', 'This is a test comment.');\n" +
        "```",
      { prompt_tokens: 1616, completion_tokens: 88, total_tokens: 1704 }
    ),
  },
  {
    request:
      prefix +
      '  await page.goto("https://katalon-demo-cura.herokuapp.com");\n' +
      "  await page.click('#btn-make-appointment');\n" +
      "  // Fill in the username\n" +
      "await page.fill('#txt-username', 'John Doe');\n\n" +
      "// Fill in the password\n" +
      "await page.fill('#txt-password', 'ThisIsNotAPassword');\n\n" +
      "// Click the login button\n" +
      "await page.click('#btn-login');\n" +
      "  await page.selectOption('.form-group .form-control', 'Hongkong CURA Healthcare Center');\n" +
      "  await page.click('#radio_program_medicaid');\n" +
      "  await page.click('.glyphicon-calendar');\n" +
      "  // Click on a specific date in the date picker\n" +
      `await page.click("text='20'");\n` +
      "  // Fill in the comment section using the id of the textarea\n" +
      "await page.fill('#txt_comment', 'This is a test comment.');\n" +
      suffix,
    response: mockAssistant(
      `The next step in the test script would be to click the "Book Appointment" button. Here's the Playwright command to do that:\n\n` +
        "```javascript\n" +
        "// Click the 'Book Appointment' button\n" +
        "await page.click('#btn-book-appointment');\n" +
        "```\n\nPlease execute this command and provide the screenshot of the result.",
      { prompt_tokens: 1486, completion_tokens: 63, total_tokens: 1549 }
    ),
  },
  {
    request:
      prefix +
      '  await page.goto("https://katalon-demo-cura.herokuapp.com");\n' +
      "  await page.click('#btn-make-appointment');\n" +
      "  // Fill in the username\n" +
      "await page.fill('#txt-username', 'John Doe');\n\n" +
      "// Fill in the password\n" +
      "await page.fill('#txt-password', 'ThisIsNotAPassword');\n\n" +
      "// Click the login button\n" +
      "await page.click('#btn-login');\n" +
      "  await page.selectOption('.form-group .form-control', 'Hongkong CURA Healthcare Center');\n" +
      "  await page.click('#radio_program_medicaid');\n" +
      "  await page.click('.glyphicon-calendar');\n" +
      "  // Click on a specific date in the date picker\n" +
      `await page.click("text='20'");\n` +
      "  // Fill in the comment section using the id of the textarea\n" +
      "await page.fill('#txt_comment', 'This is a test comment.');\n" +
      "  // Click the 'Book Appointment' button\n" +
      "await page.click('#btn-book-appointment');\n" +
      suffix,
    response: mockAssistant(
      'The screenshot shows the "Appointment Confirmation" page of the CURA Healthcare Service website. It confirms that an appointment has been booked with the following details:\n' +
        "\n" +
        "- Facility: Hongkong CURA Healthcare Center\n" +
        "- Apply for hospital readmission: No\n" +
        "- Healthcare Program: Medicaid\n" +
        "- Visit Date: 20/11/2023\n" +
        "- Comment: This is a test comment.\n" +
        "\n" +
        'The confirmation page also includes a button labeled "Go to Homepage."\n' +
        "\n" +
        "If you need to continue with the test script or perform additional actions, please provide further instructions. Otherwise, the current test script has successfully navigated through the appointment booking process and reached the confirmation page.",
      { prompt_tokens: 1504, completion_tokens: 130, total_tokens: 1634 }
    ),
  },
];

function getLastText(
  body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
): string | undefined {
  const content = body.messages[body.messages.length - 1].content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    for (const part of [...content].reverse()) {
      if (part.type === "text") {
        return part.text;
      }
    }
  }
}

function mockAssistant(
  content: string,
  usage: OpenAI.Completions.CompletionUsage
): OpenAI.Chat.Completions.ChatCompletion {
  return {
    id: "id",
    choices: [
      {
        finish_reason: "stop",
        index: 0,
        message: {
          role: "assistant",
          content,
        },
      },
    ],
    created: 1,
    model: "model",
    object: "chat.completion",
    usage,
  };
}

export function mockChatCompletion(
  body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
): OpenAI.Chat.Completions.ChatCompletion | undefined {
  const text = getLastText(body);

  for (const completion of mockedChatCompletions) {
    if (completion.request === text) {
      return completion.response;
    }
  }
}
