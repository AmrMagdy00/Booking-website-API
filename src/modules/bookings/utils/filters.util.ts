import { Types } from 'mongoose';
import { BookingStatus } from '../enums/booking-status.enum';

/**
 * Filter utilities for building database queries
 * Extracted to keep repository code clean
 */
export class FiltersUtil {
  static buildBookingQuery(filters: {
    contactId?: string;
    packageId?: string;
    userId?: string;
    status?: BookingStatus;
  }): any {
    const query: any = {};

    if (filters.contactId) {
      query.contactId = new Types.ObjectId(filters.contactId);
    }

    if (filters.packageId) {
      query.packageId = new Types.ObjectId(filters.packageId);
    }

    if (filters.userId) {
      query.userId = new Types.ObjectId(filters.userId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    return query;
  }
}
