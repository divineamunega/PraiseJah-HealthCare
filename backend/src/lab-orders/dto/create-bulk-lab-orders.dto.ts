import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBulkLabOrdersDto {
  @ApiProperty({ example: 'uuid-of-visit' })
  @IsNotEmpty()
  @IsUUID()
  readonly visitId!: string;

  @ApiProperty({ example: ['FBC', 'MP'], isArray: true })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly testNames!: string[];
}
