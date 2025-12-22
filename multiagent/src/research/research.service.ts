import { Injectable } from "@nestjs/common";
import { ResearcherAgent } from "./agents/researcher.agent";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { ReporterAgent } from "./agents/reporter.agent";
import { CriticAgent } from "./agents/critic.agent";
import { StateType } from "./graph/state";
import { createResearchGraph } from "./graph/workflow";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";

@Injectable()
export class ResearchService {
  constructor(
    private readonly researcherAgent: ResearcherAgent,
    private readonly reporterAgent: ReporterAgent,
    private readonly criticAgent: CriticAgent,
    private readonly saver: MongoDBSaver,
    @InjectPinoLogger(ResearchService.name)
    private readonly logger: PinoLogger,
  ) {}

  async runInitialResearch(task: string, threadId: string) {
    const graph = createResearchGraph(
      this.researcherAgent,
      this.reporterAgent,
      this.criticAgent,
      this.saver,
    );

    const initialState: StateType = {
      task: task,
      queries: [],
      research: [],
      sources: [],
      report: "",
      score: 0,
      feedback: "",
      iterations: 0,
    };

    const config = { configurable: { thread_id: threadId } };

    // Выполняем граф
    const finalState = (await graph.invoke(initialState, config)) as StateType;

    return {
      report: finalState.report,
      meta: {
        totalIterations: finalState.iterations,
        finalScore: finalState.score,
        sourcesFound: finalState.sources.length,
      },
    };
  }
}
