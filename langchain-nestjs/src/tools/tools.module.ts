import { Module } from "@nestjs/common";
import { CurrentTimeTool } from "./current-time.tool";
import {GetCustomerOrderTool} from "./get-customer-order.tool";
import {CalculatorTool} from "./calculator.tool";

@Module({
  providers: [
    CurrentTimeTool,
      GetCustomerOrderTool,
      CalculatorTool
  ],
  exports: [
      CurrentTimeTool,
      GetCustomerOrderTool,
      CalculatorTool
  ],
})
export class ToolsModule {}
