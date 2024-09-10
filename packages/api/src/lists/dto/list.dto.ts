export class ListDto {
  id: string;
  name: string;
  date: Date;
  items: { item: string; quantity: number }[];
}
