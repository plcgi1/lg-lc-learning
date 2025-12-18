import { Tool } from "@langchain/core/tools";
import * as math from "mathjs";

export class CalculatorTool extends Tool {
  name = "calculator";
  description =
    'A tool for performing basic arithmetic calculations. Input must be a single, valid mathematical expression (e.g., "5 + 3 * 2").';

  async _call(input: any): Promise<string> {
    // Временно используем any, так как ReAct-агент передает строку
    if (!input || typeof input !== "string") {
      return "Error: Calculator requires a valid string expression as input.";
    }

    try {
      // 🚨 ИСПОЛЬЗУЕМ БЕЗОПАСНУЮ ФУНКЦИЮ EVALUATE ИЗ MATHJS
      const result = math.evaluate(input);

      // MathJS может вернуть число, строку или объект.
      // Мы приводим результат к строке для LLM.
      return `Result of calculation "${input}" is: ${result.toString()}`;
    } catch (e) {
      // Обработка ошибок парсинга или вычисления
      // @ts-ignore
      return `Error: Could not calculate the expression "${input}". Details: ${e.message}`;
    }
  }
}
