import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/finance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Oylik tranzaksiyalarni olish' })
  getTransactions(
    @CurrentUser() user: { id: string },
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    return this.financeService.getTransactions(
      user.id,
      year ? parseInt(year) : now.getFullYear(),
      month ? parseInt(month) : now.getMonth() + 1,
    );
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Yangi tranzaksiya qo\'shish' })
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateTransactionDto,
  ) {
    return this.financeService.create(user.id, dto);
  }

  @Patch('transactions/:id')
  @ApiOperation({ summary: 'Tranzaksiyani yangilash' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.financeService.update(id, user.id, dto);
  }

  @Delete('transactions/:id')
  @ApiOperation({ summary: 'Tranzaksiyani o\'chirish' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.financeService.remove(id, user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Yillik statistika (har oy daromad/xarajat)' })
  getStats(
    @CurrentUser() user: { id: string },
    @Query('year') year: string,
  ) {
    const now = new Date();
    return this.financeService.getStats(
      user.id,
      year ? parseInt(year) : now.getFullYear(),
    );
  }
}
