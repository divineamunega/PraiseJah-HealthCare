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
        orderBy: { [sortBy]: sortOrder },
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
    const patient = await this.prisma.patient.findFirst({
      where: { id, deletedAt: null },
      select: this.patientSelect,
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(id: string, dto: UpdatePatientDto, actor: User): Promise<Partial<Patient>> {
    // We fetch the full object (including internal fields) for the audit log before updating
    const existingPatient = await this.prisma.patient.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingPatient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    const updatedPatient = await this.prisma.patient.update({
      where: { id },
      data: dto,
      select: this.patientSelect,
    });

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
    const patient = await this.prisma.patient.findFirst({
      where: { id, deletedAt: null },
      select: { id: true }
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    await this.prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
