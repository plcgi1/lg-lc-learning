import { Module, Global } from "@nestjs/common";
import { MongoClient } from "mongodb";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";

@Global() // Делаем модуль глобальным, чтобы не импортировать везде
@Module({
  providers: [
    {
      provide: "MONGO_CLIENT",
      useFactory: async () => {
        const client = new MongoClient(
          process.env.MONGO_URI || "mongodb://localhost:27017",
        );
        await client.connect();
        return client;
      },
    },
    {
      provide: MongoDBSaver,
      useFactory: (client: MongoClient) => {
        return new MongoDBSaver({
          client,
          dbName: "research_ai",
          checkpointCollectionName: "checkpoints",
          checkpointWritesCollectionName: "checkpoint_writes",
        });
      },
      inject: ["MONGO_CLIENT"],
    },
  ],
  exports: ["MONGO_CLIENT", MongoDBSaver],
})
export class MongoModule {}
