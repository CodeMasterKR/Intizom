import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsEnum, IsNumber, IsPositive,
  MinLength, MaxLength, IsDateString,
} from 'class-validator';

export enum TransactionType {
  income = 'income',
  expense = 'expense',
}

export enum TransactionCategory {
  salary = 'salary',
  freelance = 'freelance',
  investment = 'investment',
  gift = 'gift',
  other_income = 'other_income',
  food = 'food',
  transport = 'transport',
  housing = 'housing',
  health = 'health',
  education = 'education',
  entertainment = 'entertainment',
  shopping = 'shopping',
  utilities = 'utilities',
  other_expense = 'other_expense',
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'Oylik maosh' })
  @IsString() @MinLength(1) @MaxLength(100)
  title: string;

  @ApiProperty({ example: 5000000 })
  @IsNumber() @IsPositive()
  amount: number;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ enum: TransactionCategory })
  @IsEnum(TransactionCategory)
  category: TransactionCategory;

  @ApiProperty({ example: '2026-02-18' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Fevral oyligi' })
  @IsOptional() @IsString() @MaxLength(300)
  note?: string;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
