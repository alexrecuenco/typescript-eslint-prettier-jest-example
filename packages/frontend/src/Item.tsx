import type { Task } from 'interface';

interface Props {
  items: Task[];
}
export default function ItemList({ items }: Props) {
  const listItems = items.map((item) => (
    <li key={item.id}>
      {item.name} {item.age}
    </li>
  ));
  return <ol className="itemlist">{listItems}</ol>;
}
