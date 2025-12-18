import { Tool } from "@langchain/core/tools";
import { PinoLogger } from "nestjs-pino";

export class CurrentTimeTool extends Tool {
  name = "current-time-getter";
  description =
    "A tool to get the current date and time. **This is the ONLY source of time information you have.** You must use this tool if the user asks for the time.";
  logger: PinoLogger = new PinoLogger({ renameContext: CurrentTimeTool.name });
  async _call(): Promise<string> {
    const now = new Date();
    return `The current date and time in London, England is: ${now.toLocaleString("en-GB", { timeZone: "Europe/London" })}`;
  }
}
