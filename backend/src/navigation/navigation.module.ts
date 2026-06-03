import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageNavigation } from './navigation.entity';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PageNavigation])],
  providers: [NavigationService],
  controllers: [NavigationController],
  exports: [NavigationService],
})
export class NavigationModule {}
