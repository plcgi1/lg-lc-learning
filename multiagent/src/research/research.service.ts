import { Injectable } from "@nestjs/common";
import { ResearcherAgent } from "./agents/researcher.agent";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import {ReporterAgent} from "./agents/reporter.agent";
import { StateType} from './graph/state'

@Injectable()
export class ResearchService {
  constructor(
    private readonly researcherAgent: ResearcherAgent,
    private readonly reporterAgent: ReporterAgent,
    @InjectPinoLogger(ResearchService.name)
    private readonly logger: PinoLogger,
  ) {}

  async runInitialResearch(task: string) {
    const state: StateType = {
      task: task,
      queries: [],
      research: [],
      sources: [],
      report: "",
        score: 0,          // Добавлено
        feedback: "",      // Добавлено
        iterations: 0,     // Добавлено
    };

    const researchData = await this.researcherAgent.execute(state.task);

    state.queries = researchData.queries;
    state.research = researchData.results;
    this.logger.info(`🚀 Запуск исследования для задачи: ${task}`);

    const reportData = await this.reporterAgent.execute(state);

    // Финальное обновление
    state.report = reportData.report;

    return state; // Теперь в state есть всё
  }
}
