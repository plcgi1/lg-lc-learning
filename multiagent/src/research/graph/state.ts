import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  // Текст задачи от пользователя
  task: Annotation<string>(),

  queries: Annotation<string[]>({
    // Сгенерированные поисковые запросы
    reducer: (x, y) => y ?? x,
  }),

  // Результаты поиска (текстовые выжимки)
  research: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),

  // Список URL-адресов для проверки 🔗
  sources: Annotation<string[]>({
    reducer: (x, y) => [...new Set([...x, ...y])], // Убираем дубликаты
    default: () => [],
  }),

  // Итоговый отчет
  report: Annotation<string>(),

  // Оценка и комментарии
  score: Annotation<number>(),
  feedback: Annotation<string>(),

  // Счетчик итераций
  iterations: Annotation<number>({
    reducer: (x, y) => x + y,
    default: () => 0,
  }),
});

export type StateType = typeof AgentState.State;
