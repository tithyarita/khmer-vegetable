import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { AdminModule } from './admin/admin.module';
import { ProvidersModule } from './providers/providers.module';
import { ApplicationsModule } from './providers/applications.module';
import { ProductModule } from './product/product.module';
import { ProviderApplicationsModule } from './provider-application/provider-application.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
<<<<<<< HEAD
      password: 'root', // your MySQL password
=======
      password: '123', // your MySQL password
>>>>>>> 6f971ac1ca09d9773a2267113649f79a51e56ff7
      database: 'khmer_vegetable_market',
      autoLoadEntities: true,
      synchronize: true, // set to false in production
      // migrations: [__dirname + '/migration/**/*{.ts,.js}'],
    }),

    AuthModule,
    UsersModule,
    StaffModule,
    AdminModule,
    ProvidersModule,
    ApplicationsModule,
    ProductModule,
    ProviderApplicationsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
