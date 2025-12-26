import { BookingStatus } from '@/modules/bookings/enums/booking-status.enum';

export class BookingListItemDto {
  id: string;
  userId: string; // Reference to authenticated user
  contactId: string; // Reference to booking contact
  packageId: string; // Reference to package
  numberOfPeople: number;
  totalPrice: number;
  status: BookingStatus;
}

export class BookingDetailDto {
  id: string;
  userId: string; // Reference to authenticated user
  contactId: string; // Reference to booking contact
  packageId: string; // Reference to package
  numberOfPeople: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
