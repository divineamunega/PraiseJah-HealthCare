import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Patient, User, AuditTargetType, AuditAction, Prisma } from '@prisma/client';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { LoggerService } from '../logger/logger.service.js';
import { AuditService } from '../audit/audit.service.js';
import { PatientQueryDto } from './dto/patient-query.dto.js';

@Injectable()
export class PatientsService {
  private readonly patientSelect = {
    id: true,
    firstName: true,
    lastName: true,
    dateOfBirth: true,
    sex: true,
    phone: true,
    address: true,
    createdAt: true,
    updatedAt: true,
    // deletedAt is omitted
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditService: AuditService,
  ) { }

  async create(dto: CreatePatientDto): Promise<Partial<Patient>> {
    return this.prisma.patient.create({
      data: dto,
      select: this.patientSelect,
    });
  }

  async findAll(queryDto: PatientQueryDto) {
    const { page, limit, name, phone, sortBy, sortOrder } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {
      deletedAt: null,
      AND: [
        name
          ? {
            OR: [
              { firstName: { contains: name, mode: 'insensitive' } },
              { lastName: { contains: name, mode: 'insensitive' } },
            ],
          }
          : {},
        phone ? { phone: { contains: phone } } : {},
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortBy === 'name' ? undefined : sortOrder }, // Basic fix for Prisma order by
        select: this.patientSelect,
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Partial<Patient>> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      select: this.patientSelect,
    });

    // Check if patient exists (Prisma findUnique with select returns null if not found)
    // We still need to check deletedAt manually if we don't include it in select,
    // but the findUnique query doesn't allow filtering by deletedAt: null directly on ID.
    // However, we can fetch deletedAt specifically for the check.
    
    const check = await this.prisma.patient.findUnique({
      where: { id },
      select: { deletedAt: true }
    });

    if (!check || check.deletedAt) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient!;
  }

  async update(id: string, dto: UpdatePatientDto, actor: User): Promise<Partial<Patient>> {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient || existingPatient.deletedAt) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    const updatedPatient = await this.prisma.patient.update({
      where: { id },
      data: dto,
      select: this.patientSelect,
    });

    // Manual audit for updates to capture old vs new values
    await this.auditService.createLog({
      actorId: actor.id,
      action: AuditAction.PATIENT_UPDATED,
      targetType: AuditTargetType.PATIENT,
      targetId: id,
      metadata: {
        oldValue: JSON.parse(JSON.stringify(existingPatient)),
        newValue: JSON.parse(JSON.stringify(updatedPatient)),
      },
    }).catch(err => this.logger.error(`Failed to create detailed audit log: ${err.message}`));

    return updatedPatient;
  }

  async remove(id: string): Promise<void> {
    const check = await this.prisma.patient.findUnique({
      where: { id },
      select: { deletedAt: true }
    });

    if (!check || check.deletedAt) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    await this.prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
