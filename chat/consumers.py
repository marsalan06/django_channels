import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Room, Message

class ChatConsumer(WebsocketConsumer):

    def __init__(self, *args, **kwargs):
        print("======init consumer------")
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None
        self.room = None
        self.user = None

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.room = Room.objects.get(name=self.room_name)
        self.user = self.scope['user']
        print("=======connect method=====")
        print(self.room_name,self.room_group_name,self.room, self.user)

        self.accept() #accept connection

        #join group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )
        print("========self.channel_name-----")
        print(self.channel_name)

    def disconnect(self, close_code):
        print("========disconnect method=====")
        print("========self.channel_name disconnect====-----")
        print(self.channel_name)
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data=None, bytes_data=None):
        print("======recive method--------")
        print(self.channel_name)
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        if not self.user.is_authenticated:
            return None
        
        #send chat message event to the room
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type':'chat_message',
                'user': self.user.username,
                'message': message
            }
        )
        print("=====message being sent=====")
        print(self.user, self.room, message)
        Message.objects.create(user=self.user, room=self.room, content=message)

    def chat_message(self, event):
        self.send(text_data=json.dumps(event))