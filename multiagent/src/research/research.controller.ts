import { Controller, Post, Body } from "@nestjs/common";
import { ResearchService } from "./research.service";
import { CreateResearchDto } from "./dto/create-research.dto";

@Controller("research")
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  async startResearch(@Body() body: CreateResearchDto) {
    // На этом этапе мы просто запускаем первый узел графа
    return this.researchService.runInitialResearch(body.query);
  }
}
