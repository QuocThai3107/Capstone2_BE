import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSocketMap = new Map<number, string>();
  private socketUserMap = new Map<string, number>();

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    try {
      console.log('Client connected:', client.id);
      
      // Lấy token từ handshake auth (có thể bỏ qua bước này khi test)
      // const token = client.handshake.auth.token;
      // const userId = await this.verifyToken(token);
      
      // Test: Gán userId tạm thời
      const userId = client.handshake.query.userId as string;
      if (userId) {
        this.userSocketMap.set(Number(userId), client.id);
        this.socketUserMap.set(client.id, Number(userId));
        console.log(`User ${userId} connected with socket ${client.id}`);
        
        // Thông báo cho client kết nối thành công
        client.emit('connection_success', { 
          message: 'Successfully connected to chat server',
          userId: userId 
        });

        // Cập nhật danh sách người dùng online
        this.updateOnlineUsers();
      }
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      console.log(`User ${userId} disconnected`);
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(client.id);
      this.updateOnlineUsers();
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { to_user_id: number; content: string }
  ) {
    try {
      const fromUserId = this.socketUserMap.get(client.id);
      if (!fromUserId) {
        throw new Error('User not authenticated');
      }

      // Lưu tin nhắn vào database
      const message = await this.chatService.create({
        user_id: fromUserId,
        to_user_id: data.to_user_id,
        content: data.content
      });

      // Gửi tin nhắn đến người nhận nếu online
      const toSocketId = this.userSocketMap.get(data.to_user_id);
      if (toSocketId) {
        this.server.to(toSocketId).emit('newMessage', message);
      }

      // Gửi xác nhận về cho người gửi
      return { success: true, message };
    } catch (error) {
      console.error('Send message error:', error);
      return { error: error.message };
    }
  }

  private updateOnlineUsers() {
    const onlineUsers = Array.from(this.userSocketMap.keys());
    this.server.emit('onlineUsers', onlineUsers);
  }

  // Test endpoint
  @SubscribeMessage('test')
  handleTest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any
  ) {
    console.log('Test message received:', data);
    return { event: 'test_response', data: { message: 'Server received your test message' } };
  }
} 