import { Tool } from "@langchain/core/tools";
import * as math from 'mathjs';

export class CurrentTimeTool extends Tool {
  name = "current-time-getter";
  description =
    "A tool to get the current date and time. **This is the ONLY source of time information you have.** You must use this tool if the user asks for the time.";

  async _call(): Promise<string> {
    const now = new Date();
    // Мы игнорируем вход (input), так как он не нужен.
    return `The current date and time in London, England is: ${now.toLocaleString("en-GB", { timeZone: "Europe/London" })}`;
  }
}
