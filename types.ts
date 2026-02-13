
export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageURL: string;
  isAvailable: boolean;
}

export interface CartItem extends Dish {
  quantity: number;
}

export type Category = 'Основні' | 'Закуски' | 'Напої' | 'Десерти';
