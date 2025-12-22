import { Injectable } from "@nestjs/common";
import { TavilySearch } from "@langchain/tavily";
import { RedisService } from "../redis/redis.service";
import { createHash } from "crypto";

@Injectable()
export class TavilyService {
  private tool: TavilySearch;

  constructor(private readonly redisService: RedisService) {
    // Инициализируем инструмент. Ключ TAVILY_API_KEY должен быть в .env
    this.tool = new TavilySearch({
      maxResults: 3, // Для каждого подзапроса берем топ-3 результата
      // You can set other constructor parameters here, e.g.:
      // topic: "general",
      // includeAnswer: false,
      // includeRawContent: false,
      // includeImages: false,
      // searchDepth: "basic",
    });
  }

  /**
   * Выполняет поиск по одной фразе
   */
  async search(query: string): Promise<string> {
    const hash = createHash("md5")
      .update(query.toLowerCase().trim())
      .digest("hex");
    const cacheKey = `tavily:search:${hash}`;
    try {
      const cached = await this.redisService.client.get(cacheKey);
      if (cached) {
        console.log(`🎯 [TAVILY CACHE] Hit: "${query.slice(0, 30)}..."`);
        const resultStrin = JSON.parse(cached);
        return resultStrin;
      }
      // Инструмент возвращает строковое представление результатов
      const result = await this.tool.invoke({ query });
      // 4. Сохраняем в Redis (например, на 3 дня)
      const resultString = JSON.stringify(result);
      await this.redisService.client.set(
        cacheKey,
        resultString,
        "EX",
        60 * 60 * 24 * 3,
      );
      return result;
    } catch (error) {
      console.error(`Ошибка поиска Tavily для запроса "${query}":`, error);
      return ""; // Возвращаем пустую строку, чтобы не ломать Promise.all
    }
  }
}
