export interface LocationType {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  isUrgent: boolean;
  locationId: number;
  imageUri: string | null;
}
