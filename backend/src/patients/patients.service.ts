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
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreatePatientDto): Promise<Patient> {
    return this.prisma.patient.create({
      data: {
        ...dto,
        dateOfBirth: new Date(dto.dateOfBirth),
      },
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
        orderBy: { [sortBy]: sortOrder },
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

  async findOne(id: string): Promise<Patient> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!patient || patient.deletedAt) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(id: string, dto: UpdatePatientDto, actor: User): Promise<Patient> {
    const existingPatient = await this.findOne(id);

    const updatedPatient = await this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
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
    await this.findOne(id);

    await this.prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
