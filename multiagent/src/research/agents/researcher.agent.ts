import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOllama } from "@langchain/ollama";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { TavilyService } from "../../tools/tavily.service";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { AppConfig } from "../../config/interfaces/config.interface";
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { createHash } from 'crypto';

@Injectable()
export class ResearcherAgent {
  constructor(
    private readonly tavilyService: TavilyService,
    @Inject("LLM_MODEL") private readonly model: ChatOllama,
    @InjectPinoLogger(ResearcherAgent.name)
    private readonly logger: PinoLogger,
  ) {
  }

    private generateKey(input: string): string {
        const hash = createHash('md5').update(input.toLowerCase().trim()).digest('hex');
        return `res:${hash}`;
    }

  async execute(task: string) {
      const sysPrompt = new SystemMessage(`Ты — робот-аналитик, который выдает ответ СТРОГО в формате JSON. 
  ОТВЕТ СТРОГО В JSON!!!        
  Запрещено писать любой текст до или после JSON.
  Структура: { "results": ["строка1", "строка2"] }`)
       const userPrompt = new HumanMessage(`Создай 3 запроса по теме: "${task}"`)
    const parser = new JsonOutputParser<string[]>();

      const queries = await this.model.pipe(parser).invoke([
          sysPrompt,
          userPrompt
      ], );

    this.logger.info({ queries  }, "🔍 Сгенерированные запросы:");

    // TODO 2. Параллельный поиск
    // TODO const results = await Promise.all(queriesChunks);
    const results = [];
    let index = 0;
    for (const q of queries["results"]) {
        const r = await this.tavilyService.search(q);
        results.push(r);
      // console.log(`🔎 Поиск (${index + 1}/3): "${q}"`);
      // const r = await this.tavilyService.search(q);
      // console.log("RRRRRRRRRRRRR", r);
      // console.log(
      //   `📥 Получено данных для запроса ${index + 1}: ${r.length} символов`,
      // );
      // results.push(r);
      index++;
    }
    return {
      queries,
      results,
    };
  }
}
