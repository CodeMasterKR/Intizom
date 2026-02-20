import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrinciplesService } from './principles.service';
import { CreatePrincipleDto, UpdatePrincipleDto } from './dto/principle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Principles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('principles')
export class PrinciplesController {
  constructor(private principlesService: PrinciplesService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha prinsiplarni olish' })
  findAll(@CurrentUser('id') userId: string) {
    return this.principlesService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi prinsip qo\'shish' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePrincipleDto) {
    return this.principlesService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Prinsipni yangilash' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePrincipleDto,
  ) {
    return this.principlesService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Prinsipni o\'chirish' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.principlesService.remove(id, userId);
  }

  @Post(':id/check')
  @ApiOperation({ summary: 'Bugungi checkni toggle qilish' })
  toggleCheck(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.principlesService.toggleCheck(id, userId);
  }
}
