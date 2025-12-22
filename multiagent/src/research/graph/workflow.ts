import { StateGraph, START, END } from "@langchain/langgraph";
import { StateType } from "./state";
import { appConfig } from "../../config/configuration";

const globalConfig = appConfig();

export const createResearchGraph = (
  researcher: any,
  reporter: any,
  critic: any,
  saver: any,
) => {
  const workflow = new StateGraph<StateType>({
    channels: {
      task: { value: (a, b) => b, default: () => "" },
      queries: { value: (a, b) => a.concat(b), default: () => [] },
      research: { value: (a, b) => a.concat(b), default: () => [] },
      sources: { value: (a, b) => a.concat(b), default: () => [] },
      report: { value: (a, b) => b, default: () => "" },
      score: { value: (a, b) => b, default: () => 0 },
      feedback: { value: (a, b) => b, default: () => "" },
      iterations: { value: (a, b) => b, default: () => 0 },
    },
  })
    .addNode("researcher", async (state) => await researcher.execute(state))
    .addNode("reporter", async (state) => await reporter.execute(state))
    .addNode("critic", async (state) => await critic.execute(state));

  workflow.addEdge(START, "researcher");
  workflow.addEdge("researcher", "reporter");
  workflow.addEdge("reporter", "critic");

  workflow.addConditionalEdges(
    "critic",
    (state) => {
      if (
        state.score >= globalConfig.langGraph.workflow.maxScore ||
        state.iterations >= globalConfig.langGraph.workflow.maxScore
      ) {
        return "end";
      }
      console.log(
        `🔄 Ревизия #${state.iterations + 1}. Фидбек: ${state.feedback}`,
      );
      return "researcher";
    },
    {
      end: END,
      researcher: "researcher",
    },
  );

  return workflow.compile({ checkpointer: saver });
};
