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

        #join the room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )
        print("========self.channel_name-----")
        print(self.channel_name)

        #send all users as list to the new joined user
        self.send(json.dumps({
            'type' : 'user_list',
            'users' : [user.username for user in self.room.online.all()] #get all users from the room
        }))

        #send the join msg to everyone in the group by an event
        if self.user.is_authenticated:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type':'user_join',
                    'user': self.user.username,
                }
            )
            self.room.online.add(self.user) #update the user in room, many to many


    def disconnect(self, close_code):
        print("========disconnect method=====")
        print("========self.channel_name disconnect====-----")
        print(self.channel_name)
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

        #remove the user from the room and emit an event
        if self.user.is_authenticated:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type':'user_leave',
                    'user':self.user.username,
                }
            )
            self.room.online.remove(self.user)


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


    def user_join(self, event):
        self.send(text_data=json.dumps(event))

    def user_leave(self, event):
        self.send(text_data=json.dumps(event))