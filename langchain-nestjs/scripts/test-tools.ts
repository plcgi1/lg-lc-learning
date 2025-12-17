import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

async function checkToolCalling() {
    const llm = new ChatOllama({
        model: "llama3:8b-instruct-q4_0", // Ваша модель
        temperature: 0,
    });

    // Определяем инструмент в новом стиле (через Zod)
    const currentTimeTool = tool(
        async () => {
            return new Date().toISOString();
        },
        {
            name: "get_current_time",
            description: "Get the current date and time",
            schema: z.object({}), // Пустой объект параметров
        }
    );

    // Привязываем инструмент к модели
    const llmWithTools = llm.bindTools([currentTimeTool]);

    console.log("--- Sending request to Llama 3 ---");

    const response = await llmWithTools.invoke("Который сейчас час?");

    console.log("Raw Response Content:", response.content);
    console.log("Tool Calls:", JSON.stringify(response.tool_calls, null, 2));

    if (response.tool_calls && response.tool_calls.length > 0) {
        console.log("✅ УСПЕХ: Llama 3 поняла формат и вызвала инструмент!");
    } else {
        console.log("❌ ПРОВАЛ: Llama 3 просто ответила текстом без вызова инструмента.");
    }
}

checkToolCalling().catch(console.error);