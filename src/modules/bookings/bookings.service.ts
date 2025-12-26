import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingsRepository } from './bookings.repository';
import { BookingsMapper } from './mappers/bookings.mapper';
import { AppLogger } from '@/common/logger/app-logger.service';
import { BookingContactService } from './booking-contact/booking-contact.service';
import { PackagesService } from '@/modules/packages/packages.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { UpdateBookingDto } from './dtos/update-booking.dto';
import { QueryBookingDto } from './dtos/query-booking.dto';
import {
  BookingListItemDto,
  BookingDetailDto,
} from './dtos/booking-response.dto';
import { ValidationUtil } from './utils/validation.util';
import { FiltersUtil } from './utils/filters.util';
import { PaginationUtil } from './utils/pagination.util';
import { JWTPayloadType } from '@/common/auth/types/jwt-payload.type';
import { UserRole } from '@/modules/users/enums/user-role.enum';

/**
 * BookingsService - Business logic layer for bookings
 * Handles all business rules, error handling, and orchestrates repository, mapper, and external services
 * Logs important operations and errors using AppLogger
 */
@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly bookingsMapper: BookingsMapper,
    private readonly logger: AppLogger,
    private readonly bookingContactService: BookingContactService,
    private readonly packagesService: PackagesService,
  ) {}

  async create(
    dto: CreateBookingDto,
    currentUser: JWTPayloadType,
  ): Promise<BookingDetailDto> {
    try {
      this.logger.info('Creating new booking', {
        packageId: dto.packageId,
        actorId: currentUser.id,
      });

      // Validate package exists
      await ValidationUtil.validatePackage(this.packagesService, dto.packageId);

      // Create booking contact automatically
      const contact = await this.bookingContactService.create({
        name: dto.contact.name,
        email: dto.contact.email,
        phone: dto.contact.phone,
        userId: currentUser.id,
      });

      // Create booking with the contact ID
      const bookingData = this.bookingsMapper.toBookingData({
        ...dto,
        userId: currentUser.id,
        contactId: contact._id.toString(),
      });

      const createdBooking = await this.bookingsRepository.create(bookingData);

      this.logger.info('Booking created successfully', {
        bookingId: createdBooking._id,
        contactId: contact._id,
      });

      return this.bookingsMapper.toDetailDto(createdBooking);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Failed to create booking', { error, dto });
      throw new BadRequestException('Failed to create booking');
    }
  }

  async findAll(
    queryDto: QueryBookingDto,
    currentUser: JWTPayloadType,
  ): Promise<{
    items: BookingListItemDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 10;

      this.logger.info('Fetching bookings', {
        actorId: currentUser.id,
        page,
        limit,
      });

      const queryBuilder: any = {
        contactId: queryDto.contactId,
        packageId: queryDto.packageId,
        status: queryDto.status,
      };

      if (currentUser.role !== UserRole.ADMIN) {
        queryBuilder.userId = currentUser.id;
      } else if (queryDto.userId) {
        queryBuilder.userId = queryDto.userId;
      }

      const query = FiltersUtil.buildBookingQuery(queryBuilder);

      const { bookings, total } = await this.bookingsRepository.findAll(
        query,
        page,
        limit,
      );

      const items = this.bookingsMapper.toListItemDtoArray(bookings);
      const meta = PaginationUtil.calculateMeta(total, page, limit);

      return { items, meta };
    } catch (error) {
      this.logger.error('Failed to fetch bookings', { error });
      throw new InternalServerErrorException('Failed to fetch bookings');
    }
  }

  async findById(
    id: string,
    currentUser: JWTPayloadType,
  ): Promise<BookingDetailDto> {
    try {
      this.logger.info('Fetching booking by ID', {
        bookingId: id,
        actorId: currentUser.id,
      });

      const booking = await this.bookingsRepository.findById(id);

      if (!booking) {
        this.logger.warn('Booking not found', { bookingId: id });
        throw new NotFoundException('Booking not found');
      }

      if (
        currentUser.role !== UserRole.ADMIN &&
        booking.userId.toString() !== currentUser.id
      ) {
        throw new ForbiddenException(
          'You are not allowed to view this booking',
        );
      }

      return this.bookingsMapper.toDetailDto(booking);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error('Failed to fetch booking', { error, id });
      throw new InternalServerErrorException('Failed to fetch booking');
    }
  }

  async update(
    id: string,
    dto: UpdateBookingDto,
    currentUser: JWTPayloadType,
  ): Promise<BookingDetailDto> {
    try {
      this.logger.info('Updating booking', {
        bookingId: id,
        actorId: currentUser.id,
      });

      const existingBooking = await this.bookingsRepository.findById(id);

      if (!existingBooking) {
        this.logger.warn('Booking not found for update', { bookingId: id });
        throw new NotFoundException('Booking not found');
      }

      // Note: contactId updates are not supported
      // Contact information is tied to the booking and should not be changed
      // If contact update is needed, it should be handled separately

      if (
        currentUser.role !== UserRole.ADMIN &&
        existingBooking.userId.toString() !== currentUser.id
      ) {
        throw new ForbiddenException(
          'You are not allowed to update this booking',
        );
      }

      // Validate package if being updated
      if (dto.packageId) {
        await ValidationUtil.validatePackage(
          this.packagesService,
          dto.packageId,
        );
      }

      const updateData = this.bookingsMapper.toUpdateData(dto);

      const updatedBooking = await this.bookingsRepository.updateById(
        id,
        updateData,
      );

      if (!updatedBooking) {
        this.logger.warn('Failed to update booking', { bookingId: id });
        throw new NotFoundException('Booking not found');
      }

      this.logger.info('Booking updated successfully', { bookingId: id });

      return this.bookingsMapper.toDetailDto(updatedBooking);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error('Failed to update booking', { error, id, dto });
      throw new BadRequestException('Failed to update booking');
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      this.logger.info('Deleting booking', { bookingId: id });

      const existingBooking = await this.bookingsRepository.findById(id);

      if (!existingBooking) {
        this.logger.warn('Booking not found for deletion', { bookingId: id });
        throw new NotFoundException('Booking not found');
      }

      const deletedBooking = await this.bookingsRepository.deleteById(id);

      if (!deletedBooking) {
        this.logger.warn('Failed to delete booking', { bookingId: id });
        throw new NotFoundException('Booking not found');
      }

      this.logger.info('Booking deleted successfully', { bookingId: id });

      return { message: 'Booking deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('Failed to delete booking', { error, id });
      throw new InternalServerErrorException('Failed to delete booking');
    }
  }
}
