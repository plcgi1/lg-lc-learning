import { Inject, Injectable } from "@nestjs/common";
import { ChatOllama } from "@langchain/ollama";
import { StateType } from "../graph/state";

@Injectable()
export class ReporterAgent {
  constructor(@Inject("LLM_MODEL") private readonly model: ChatOllama) {}

  async execute(state: StateType): Promise<Partial<StateType>> {
    console.info("📝 Шаг: Reporter — формирование отчета...", state);

      const context = state.research
          .map((r: any) => {
              const text = typeof r === 'string' ? r : (r.content || JSON.stringify(r));
              return text.slice(0, 2000);
          })
          .join('\n---\n')
          .slice(0, 10000); // Итоговый лимит 10к символов

    const prompt = `Ты — профессиональный технический писатель. 
    На основе собранных данных по теме "${state.task}", напиши подробный аналитический отчет.
   
    ДАННЫЕ ИЗ СЕТИ:
    ${context}
    
   ИНСТРУКЦИЯ:
    1. Пиши на русском языке.
    2. Используй Markdown: заголовки и списки.
    3. Если данных недостаточно — напиши только то, что нашел.
    4. НЕ ПИШИ вступление ("Конечно, вот ваш отчет"). Сразу начинай с заголовка.`;

    const response = await this.model.invoke(prompt);
      const reportText = response.content.toString();
      console.info(`✅ Отчет готов (${reportText.length} симв.)`);
    return {
      report: reportText,
    };
  }
}
