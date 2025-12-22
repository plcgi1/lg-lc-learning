import { Module } from "@nestjs/common";
import { ResearchController } from "./research.controller";
import { ResearchService } from "./research.service";
import { ResearcherAgent } from "./agents/researcher.agent";
import { TavilyService } from "../tools/tavily.service";
import { LlmModule } from "../llm/llm.module";
import { ReporterAgent } from "./agents/reporter.agent";
import { CriticAgent } from "./agents/critic.agent";

@Module({
  imports: [LlmModule],
  controllers: [ResearchController],
  providers: [
    ResearchService,
    ResearcherAgent,
    TavilyService,
    ReporterAgent,
    CriticAgent,
  ],
  exports: [ResearchService],
})
export class ResearchModule {}
