import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { TaskEntity } from './entities/task.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: [TaskEntity],
  migrations: [],
  subscribers: [],
});
