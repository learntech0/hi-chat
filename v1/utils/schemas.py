from marshmallow import fields, Schema, post_dump

class LatestChatSchema(Schema):
    message = fields.Str()
    time = fields.DateTime(format="%H:%M")

class UserSchema(Schema):
    user_id = fields.Str()
    name = fields.Str()
    email = fields.Email()
    profile = fields.Str()
    latest_chat = fields.Nested(LatestChatSchema, allow_none=True)

    @post_dump(pass_many=True)
    def add_latest_chat_to_users(self, data, many, **kwargs):
        if many:
            for user_data in data:
                latest_chat = user_data.get('latest_chat')
                if latest_chat:
                    user_data['latest_chat'] = latest_chat[0] if latest_chat else None
        else:
            latest_chat = data.get('latest_chat')
            if latest_chat:
                data['latest_chat'] = latest_chat[0] if latest_chat else None
        return data

class GroupSchema(Schema):
    group_id = fields.Str()
    group_name = fields.Str()
    description = fields.Str()
    profile = fields.Str()
    latest_chat = fields.Nested(LatestChatSchema, allow_none=True)

    @post_dump(pass_many=True)
    def add_latest_chat_to_groups(self, data, many, **kwargs):
        if many:
            for group_data in data:
                latest_chat = group_data.get('latest_chat')
                if latest_chat:
                    group_data['latest_chat'] = latest_chat[0] if latest_chat else None
        else:
            latest_chat = data.get('latest_chat')
            if latest_chat:
                data['latest_chat'] = latest_chat[0] if latest_chat else None
        return data