/* eslint-disable no-console */
import { AppDataSource } from './data-source.js';
import { TaskEntity } from './entities/task.entity.js';

AppDataSource.initialize()
  .then(async () => {
    console.log('Inserting a new user into the database...');
    const task = new TaskEntity();
    task.name = 'Timber';
    await AppDataSource.manager.save(task);
    console.log('Saved a new user with id: ' + task.id);

    console.log('Loading users from the database...');
    const tasks = await AppDataSource.manager.find(TaskEntity);
    console.log('Loaded users: ', tasks);

    console.log(
      'Here you can setup and run express / fastify / any other framework.',
    );
  })
  .catch((error) => console.log(error));
