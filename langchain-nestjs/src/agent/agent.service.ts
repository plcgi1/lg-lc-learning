import { Injectable, Logger } from "@nestjs/common";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AgentExecutor, ZeroShotAgent } from "@langchain/classic/agents";
import { LLMChain } from "@langchain/classic/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";
import { LLMService } from "../llm/llm.service";
import { CurrentTimeTool } from "../tools/current-time.tool";
import { BufferMemory } from "@langchain/classic/memory";
import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { CalculatorTool } from '../tools/calculator.tool';
import { GetCustomerOrderTool } from   '../tools/get-customer-order.tool'

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly llm: BaseChatModel;
  private readonly tools: StructuredTool<any>[];

  constructor(
    private readonly llmsService: LLMService,
  ) {
    this.llm = this.llmsService.getChatModel();
    // Собираем массив всех доступных инструментов
    this.tools = [
      new CurrentTimeTool(),
      new CalculatorTool(),
        new GetCustomerOrderTool(),
    ];
    this.logger.log(
      `AgentService initialized with ${this.tools.length} tool(s).`,
    );
  }

  /**
   * Инициализирует и запускает Agent Executor для заданной сессии.
   * @param sessionId - ID текущей сессии для памяти.
   * @param message - Сообщение пользователя.
   * @param history - Объект истории сообщений (LangChain ChatHistory).
   */
  public async runAgent(
    sessionId: string,
    message: string,
    history: BaseChatMessageHistory,
  ): Promise<string> {
    const toolNames = this.tools.map((tool) => tool.name);
    const toolDescriptions = this.tools
      .map((tool) => `${tool.name}: ${tool.description}`)
      .join("\n");

    const memory = new BufferMemory({
      chatHistory: history,
      memoryKey: "history",
      inputKey: "input",
    });
    // 2. Создание PromptTemplate с помощью ZeroShotAgent.createPrompt
    // Мы передаем список инструментов, и createPrompt сам сгенерирует
    // переменные {tools} и {tool_names}
    // src/agent/agent.service.ts (изменяем templateString)

    const templateString = `You are a machine that strictly follows the output format. 
You MUST NOT output any JSON, XML, or other structured data formats for the Final Answer.
The Final Answer must be plain text only on question language.

You have access to the following tools: {tool_names}.

If the Question asks for the current time or date, you MUST use the "current-time-getter" tool immediately.
If the Question involves arithmetic or requires a calculation, you MUST use the "calculator" tool immediately.
If the Question asks sbout customer's order, you MUST use the "get_customer_order" tool immediately.
If the Question can be answered using only your internal knowledge (e.g., general knowledge, identity, greetings), you MUST SKIP the Action/Observation cycle and proceed IMMEDIATELY to Final Answer.
You MUST ONLY use actions from the list [{tool_names}]. DO NOT generate Action: None or Action: N/A.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: ALWAYS provide some text here. If you have no input, just write a single dot "."
Observation: the result of the action
... 
Thought: I have finished using the tools and I am ready to give the final answer.
Final Answer: the final answer to the original input question. You MUST include all details provided by the tools (like status, dates, or IDs) without omitting them.DONOT change any tool's answer

Begin!

{tools}

{history}
Question: {input}
{agent_scratchpad}`;
    const agentPrompt = new PromptTemplate({
      template: templateString,
      // Указываем только те переменные, которые меняются при каждом запросе
      inputVariables: ["input", "agent_scratchpad", "history"],
      // partialVariables - это переменные, которые мы "запекаем" в промпт один раз
      partialVariables: {
        tool_names: toolNames.join(","),
        tools: toolDescriptions, // Если в шаблоне есть {tools}, используйте это
      },
    });

    // 3. Создание LLMChain
    const llmChain = new LLMChain({
      llm: this.llm,
      prompt: agentPrompt,
    });

    // 4. Создание ZeroShotAgent
    const agent = new ZeroShotAgent({
      llmChain: llmChain,
      // allowedTools: this.tools.map(tool => tool.name), // Только имена, если агент требует
      allowedTools: this.tools.map((tool) => tool.name), // Передаем сами объекты инструментов
    });

    // 5. Создание AgentExecutor
    const executor = AgentExecutor.fromAgentAndTools({
      agent: agent,
      tools: this.tools,
      memory: memory, // Передаем память для {chat_history}
      verbose: true,
      handleParsingErrors: true,
        // handleParsingErrors: (e) => {
        //     return "Ой, я ошибся в формате. Мне нужно придерживаться формата Thought/Action/Action Input. Попробую еще раз.";
        // },
        // // 2. Ограничиваем количество итераций, чтобы не платить за бесконечные циклы
        // maxIterations: 5,
    });

    try {
      this.logger.log(`Running AgentExecutor for session ${sessionId}.`);

      const result = await executor.invoke({ input: message });

      return result.output;
    } catch (error) {
      this.logger.error(
        `AgentExecutor failed for session ${sessionId}.`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
