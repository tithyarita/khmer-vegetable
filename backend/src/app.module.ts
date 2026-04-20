import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { AdminModule } from './admin/admin.module';
import { ProvidersModule } from './providers/providers.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root', // your MySQL password
      database: 'khmer_vegetable_market',
      autoLoadEntities: true,
      synchronize: true,
    }),

    AuthModule,
    UsersModule,
    StaffModule,
    AdminModule,
    ProvidersModule,
    ApplicationsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
