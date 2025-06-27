import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/common/database/database.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import configuration from './configuration/configuration';
import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      level: 'debug',
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          stores: new KeyvRedis(config.get('REDIS_URL')),
        };
      },
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class CommonModule {}
