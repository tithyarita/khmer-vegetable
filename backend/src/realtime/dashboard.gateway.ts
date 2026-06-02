import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DashboardGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('📡 Dashboard WebSocket initialized');
  }

  // 🔥 send live dashboard update
  emitDashboardUpdate(data: any) {
    this.server.emit('dashboard:update', data);
  }

  // 🔥 send new order live
  emitNewOrder(order: any) {
    this.server.emit('order:new', order);
  }
}