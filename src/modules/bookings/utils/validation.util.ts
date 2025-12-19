import { NotFoundException } from '@nestjs/common';
import { PackagesService } from '@/modules/packages/packages.service';
import { BookingContactService } from '../booking-contact/booking-contact.service';

/**
 * Validation utilities for booking operations
 * Extracted to keep service code clean
 */
export class ValidationUtil {
  static async validatePackage(
    packagesService: PackagesService,
    packageId: string,
  ): Promise<void> {
    try {
      await packagesService.findById(packageId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Package not found');
      }
      throw error;
    }
  }

  static async validateContact(
    bookingContactService: BookingContactService,
    contactId: string,
  ): Promise<void> {
    try {
      await bookingContactService.findById(contactId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Booking contact not found');
      }
      throw error;
    }
  }
}
