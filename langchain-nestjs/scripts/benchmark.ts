import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

const MODELS = [
  "llama3:8b-instruct-q4_0",
  "llama3:8b-instruct-q6_K",
];

const TEST_PROMPT = `You are a ReAct agent. Answer the question using the following format:
Thought: [your reasoning]
Action: calculator
Action Input: [math expression]

Question: Сколько будет (125 * 4) + 50?`;

async function runBenchmark() {
  console.log("🚀 Начинаем тестирование моделей...\n");
  const results = [];

  for (const modelName of MODELS) {
    console.log(`📡 Тестируем: ${modelName}...`);
    
    const llm = new ChatOllama({
      model: modelName,
      temperature: 0,
    });

    const start = performance.now();
    try {
      const response = await llm.invoke([new HumanMessage(TEST_PROMPT)]);
      const end = performance.now();
      
      const duration = ((end - start) / 1000).toFixed(2);
      
      results.push({
        model: modelName,
        time: `${duration}s`,
        output: response.content.toString().substring(0, 1900).replace(/\n/g, " ") + "..."
      });
    } catch (e) {
      results.push({ model: modelName, time: "ERROR", output: "Не удалось загрузить модель" });
    }
  }

  console.log("\n📊 РЕЗУЛЬТАТЫ СРАВНЕНИЯ:");
  console.table(results);
}

runBenchmark().catch(console.error);

// TLfMdAQEY2iDWFsMdYeoVHxWAYbbYLghEM

// TLfMdAQEY2iDWFsMdYeoVHxWAYbbYLghEM