import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { AdminModule } from './admin/admin.module';
import { ProvidersModule } from './providers/providers.module';
import { ApplicationsModule } from './providers/applications.module';
import { ProductModule } from './product/product.module';
import { ProviderApplicationsModule } from './provider-application/provider-application.module';
import { CartModule } from './cart/cart.module';
import { FavoriteModule } from './favorite/favorite.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AddressModule } from './address/address.module';
import { AppService } from './app.service';
import { MailModule } from './mail/mail.module';
import { OrdersModule } from './users/orders.module';
import { ReportModule } from './report/report.module';
import {ReviewModule} from "./review/review.module";
import { VerifyController } from './verify/verify.controller';
import { NavigationModule } from './navigation/navigation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      // Use 'db' for Docker Compose, 'localhost' for local dev (set in .env)
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'Khmer_vegetable_market',
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      migrations: [__dirname + '/migrations/**/*{.js,.ts}'],
      // migrationsRun: false,
      autoLoadEntities: true,
      synchronize: false,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    StaffModule,
    AdminModule,
    ProvidersModule,
    ApplicationsModule,
    ProductModule,
    ProviderApplicationsModule,
    ReportModule,
    CartModule,
    FavoriteModule,
    ReviewModule,
    AddressModule,
    MailModule,
    NavigationModule,
  ],
  controllers: [AppController, VerifyController],
  providers: [AppService],
})
export class AppModule {}
