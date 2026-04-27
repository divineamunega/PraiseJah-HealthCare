import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, replace with your frontend URL
  },
  namespace: 'clinical',
})
export class VisitsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('VisitsGateway');

  afterInit(server: Server) {
    this.logger.log('Clinical WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Staff Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Staff Disconnected: ${client.id}`);
  }

  broadcastQueueUpdate() {
    this.server.emit('queue_updated', { timestamp: new Date() });
  }

  broadcastVisitUpdate(visitId: string) {
    this.server.emit('visit_updated', { visitId, timestamp: new Date() });
  }

  broadcastLabResultsReady(visitId: string, doctorId: string) {
    this.server.emit('lab_results_ready', {
      visitId,
      doctorId,
      timestamp: new Date(),
    });
  }
}
