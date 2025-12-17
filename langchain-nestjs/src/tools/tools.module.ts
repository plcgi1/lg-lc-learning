// src/tools/tools.module.ts

import { Module } from "@nestjs/common";
import { CurrentTimeTool } from "./current-time.tool";

@Module({
  providers: [
    // Предоставляем класс-инструмент как провайдер
    CurrentTimeTool,
  ],
  exports: [CurrentTimeTool],
})
export class ToolsModule {}
