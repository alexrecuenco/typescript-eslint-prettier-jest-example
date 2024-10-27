import type { Task } from 'interface';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  type Repository,
} from 'typeorm';

@Entity()
export class TaskEntity implements Task {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({ default: 0 })
  etag: number;
}

export async function updateTask(
  task: Task,
  repository: Repository<TaskEntity>,
) {
  // Update the task by checking the id and the etag being the same and incrementing the etag atomically
  const { id, etag, ...rest } = task;
  return await repository.update(
    { id: task.id, etag: task.etag },
    { ...rest, etag: () => 'etag + 1' },
  );
}
