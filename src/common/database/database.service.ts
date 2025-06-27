import { Pool } from 'pg';
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { CamelCasePlugin, Kysely, LogEvent, PostgresDialect } from 'kysely';
import { DB } from './kysely-types';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService
  extends Kysely<DB>
  implements OnModuleDestroy, OnModuleInit
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private config: ConfigService,
  ) {
    const dialect = new PostgresDialect({
      pool: new Pool({
        connectionString: config.get('database_url'),
      }),
    });

    super({
      dialect,
      plugins: [new CamelCasePlugin()],
      log: (event: LogEvent) => {
        if (event.level === 'query') {
          logger.debug(`[DB QUERY] ${event.query.sql}`);
        } else if (event.level === 'error') {
          logger.error(`[DB ERROR] ${event.query?.sql} - ${event.error}`);
        }
      },
    });
  }

  onModuleInit() {
    this.logger.info('DatabaseService Initialized');
  }

  onModuleDestroy() {
    this.destroy();
    this.logger.info('DatabaseService destroyed');
  }
}
