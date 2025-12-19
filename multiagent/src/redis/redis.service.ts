import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    public readonly client: Redis = new Redis({
        host: 'localhost',
        port: 6379,
    });


    onModuleDestroy() {
        this.client.quit();
    }
}