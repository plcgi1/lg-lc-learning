import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AgentExecutor, ZeroShotAgent } from "@langchain/classic/agents";
import { LLMChain } from "@langchain/classic/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";
import { LLMService } from "../llm/llm.service";
import { CurrentTimeTool } from "../tools/current-time.tool";
import { BufferMemory } from "@langchain/classic/memory";
import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { CalculatorTool } from "../tools/calculator.tool";
import { GetCustomerOrderTool } from "../tools/get-customer-order.tool";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

@Injectable()
export class AgentService {
  private readonly llm: BaseChatModel;
  private readonly tools: StructuredTool<any>[];

  constructor(
    private readonly llmsService: LLMService,
    @InjectPinoLogger(AgentService.name)
    private readonly logger: PinoLogger,
  ) {
    this.llm = this.llmsService.getChatModel();
    // Собираем массив всех доступных инструментов
    this.tools = [
      new CurrentTimeTool(),
      new CalculatorTool(),
      new GetCustomerOrderTool(),
    ];
    this.logger.info(
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
    const templateString = `You are a machine that strictly follows the output format. 
You MUST NOT output any JSON, XML, or other structured data formats for the Final Answer.
You MUST provide Final Answer as plain text and on language which used for question.

You have access to the following tools: {tool_names}.

If the Question asks for the current time or date, you MUST use the "current-time-getter" tool immediately.
If the Question involves arithmetic or requires a calculation, you MUST use the "calculator" tool immediately.
If the Question asks sbout customer's order, you MUST use the "get_customer_order" tool immediately without any modifications.
If the Question can be answered using only your internal knowledge (e.g., general knowledge, identity, greetings), you MUST SKIP the Action/Observation cycle and proceed IMMEDIATELY to Final Answer.
You MUST ONLY use actions from the list [{tool_names}]. DO NOT generate Action: None or Action: N/A.

Use the following format:

Question: the input question you must answer
Action: the action to take, should be one of [{tool_names}]
Action Input: The specific input for the tool (e.g., the order ID, the mathematical expression, or "." only if absolutely no data is provided in the Question).
Observation: the result of the action
(After receiving an Observation, you MUST provide a Thought and then a Final Answer)
Thought: I now have the information needed to answer the question.
Final Answer: [your response here]

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

    const llmChain = new LLMChain({
      llm: this.llm,
      prompt: agentPrompt,
    });

    const agent = new ZeroShotAgent({
      llmChain: llmChain,
      allowedTools: this.tools.map((tool) => tool.name),
    });

    const executor = AgentExecutor.fromAgentAndTools({
      agent: agent,
      tools: this.tools,
      memory: memory,
      verbose: true,
      handleParsingErrors: true,
      maxIterations: 8,
    });

    const result = await this.invokeWithRetry(
        executor,
        message,
        sessionId
    )
      return result
  }

  /**
   * Задержка с экспоненциальным ростом
   * @param attempt - текущая попытка
   */
  private async delay(attempt: number): Promise<void> {
    const delayMs = Math.pow(2, attempt) * 100 + Math.random() * 100; // 2^n * 100ms + джиттер
    this.logger.warn(
      `Attempt ${attempt + 1} failed. Retrying in ${delayMs.toFixed(0)}ms...`,
    );
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  async invokeWithRetry(
    executor: AgentExecutor,
    message: string,
    sessionId: string,
    maxRetries: number = 3,
  ): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        this.logger.info(`Running AgentExecutor for session ${sessionId}.`);

        const result = await executor.invoke({ input: message });

        return result.output;
      } catch (error) {
        this.logger.error(
            { error },
          `AgentService Call Failed (Attempt ${attempt + 1}):`,
        );

        // В продакшене здесь проверяют коды ошибок (429, 500)
        // @eslint-ignore
        if (attempt === maxRetries - 1) {
          throw new InternalServerErrorException(
            "AgentService is currently unavailable or busy after multiple retries.",
          );
        }

        await this.delay(attempt);
      }
    }
  }
}
