import { Controller, Post, Body } from "@nestjs/common";
import { ResearchService } from "./research.service";
import { CreateResearchDto } from "./dto/create-research.dto";

@Controller("research")
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  async startResearch(@Body() body: CreateResearchDto) {
    return this.researchService.runInitialResearch(body.query, body.threadId);
  }
}
