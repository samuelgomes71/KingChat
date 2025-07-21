from typing import List, Optional
from datetime import datetime
from database import get_collection
from models import Chat, ChatCreate, ChatUpdate, ChatType, User
import uuid

class ChatService:
    @staticmethod
    async def create_chat(chat_data: ChatCreate, creator_id: str) -> Chat:
        """Create a new chat"""
        chats_collection = await get_collection("chats")
        
        chat_dict = chat_data.dict()
        chat_dict["id"] = str(uuid.uuid4())
        chat_dict["created_at"] = datetime.utcnow()
        chat_dict["updated_at"] = datetime.utcnow()
        
        # Add creator to participants/members based on chat type
        if chat_data.type == ChatType.private:
            chat_dict["participants"] = [creator_id] + chat_data.participants
        else:
            chat_dict["members"] = [creator_id] + chat_data.participants
            chat_dict["admins"] = [creator_id]
            chat_dict["owner"] = creator_id
        
        # Set default values based on chat type
        if chat_data.type == ChatType.channel:
            chat_dict["is_public"] = chat_data.is_public
            chat_dict["subscribers_count"] = len(chat_dict["members"])
        elif chat_data.type == ChatType.bot:
            chat_dict["is_verified"] = True
            chat_dict["bot_commands"] = ["/help", "/start", "/stop"]
        
        await chats_collection.insert_one(chat_dict)
        return Chat(**chat_dict)
    
    @staticmethod
    async def get_user_chats(user_id: str) -> List[Chat]:
        """Get all chats for a user"""
        chats_collection = await get_collection("chats")
        
        # Find chats where user is participant, member, or it's a public channel
        query = {
            "$or": [
                {"participants": user_id},
                {"members": user_id},
                {"type": "channel", "is_public": True}
            ],
            "is_archived": {"$ne": True}
        }
        
        cursor = chats_collection.find(query).sort("updated_at", -1)
        chats = []
        async for chat_data in cursor:
            chats.append(Chat(**chat_data))
        
        return chats
    
    @staticmethod
    async def get_chat_by_id(chat_id: str, user_id: str) -> Optional[Chat]:
        """Get a specific chat by ID"""
        chats_collection = await get_collection("chats")
        
        chat_data = await chats_collection.find_one({"id": chat_id})
        if not chat_data:
            return None
        
        chat = Chat(**chat_data)
        
        # Check if user has access to this chat
        if not ChatService.user_has_access(chat, user_id):
            return None
        
        return chat
    
    @staticmethod
    async def update_chat(chat_id: str, chat_update: ChatUpdate, user_id: str) -> Optional[Chat]:
        """Update a chat"""
        chats_collection = await get_collection("chats")
        
        # First check if user has permission to update
        chat = await ChatService.get_chat_by_id(chat_id, user_id)
        if not chat:
            return None
        
        # Check if user is admin or owner
        if user_id not in chat.admins and chat.owner != user_id:
            return None
        
        update_data = {k: v for k, v in chat_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        await chats_collection.update_one(
            {"id": chat_id},
            {"$set": update_data}
        )
        
        return await ChatService.get_chat_by_id(chat_id, user_id)
    
    @staticmethod
    async def delete_chat(chat_id: str, user_id: str) -> bool:
        """Delete a chat (only owner can delete)"""
        chats_collection = await get_collection("chats")
        
        chat = await ChatService.get_chat_by_id(chat_id, user_id)
        if not chat or chat.owner != user_id:
            return False
        
        await chats_collection.delete_one({"id": chat_id})
        
        # Also delete all messages in this chat
        messages_collection = await get_collection("messages")
        await messages_collection.delete_many({"chat_id": chat_id})
        
        return True
    
    @staticmethod
    async def join_chat(chat_id: str, user_id: str) -> bool:
        """Join a public chat/channel"""
        chats_collection = await get_collection("chats")
        
        chat_data = await chats_collection.find_one({"id": chat_id})
        if not chat_data:
            return False
        
        chat = Chat(**chat_data)
        
        # Only allow joining public channels or groups
        if not chat.is_public and chat.type not in [ChatType.channel, ChatType.group]:
            return False
        
        # Check if already a member
        if user_id in chat.members:
            return True
        
        # Add user to members
        await chats_collection.update_one(
            {"id": chat_id},
            {
                "$addToSet": {"members": user_id},
                "$inc": {"subscribers_count": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return True
    
    @staticmethod
    async def leave_chat(chat_id: str, user_id: str) -> bool:
        """Leave a chat"""
        chats_collection = await get_collection("chats")
        
        chat = await ChatService.get_chat_by_id(chat_id, user_id)
        if not chat:
            return False
        
        # Don't allow owner to leave (they need to transfer ownership first)
        if chat.owner == user_id:
            return False
        
        # Remove from members/participants
        update_query = {
            "$pull": {"members": user_id, "participants": user_id, "admins": user_id},
            "$set": {"updated_at": datetime.utcnow()}
        }
        
        if chat.type == ChatType.channel:
            update_query["$inc"] = {"subscribers_count": -1}
        
        await chats_collection.update_one({"id": chat_id}, update_query)
        
        return True
    
    @staticmethod
    async def update_last_message(chat_id: str, message_text: str, timestamp: datetime):
        """Update chat's last message info"""
        chats_collection = await get_collection("chats")
        
        await chats_collection.update_one(
            {"id": chat_id},
            {
                "$set": {
                    "last_message": message_text,
                    "last_message_time": timestamp,
                    "updated_at": timestamp
                }
            }
        )
    
    @staticmethod
    def user_has_access(chat: Chat, user_id: str) -> bool:
        """Check if user has access to a chat"""
        if chat.type == ChatType.private:
            return user_id in chat.participants
        elif chat.type == ChatType.channel and chat.is_public:
            return True
        else:
            return user_id in chat.members
    
    @staticmethod
    async def get_chats_by_type(user_id: str, chat_type: ChatType) -> List[Chat]:
        """Get chats filtered by type"""
        chats_collection = await get_collection("chats")
        
        query = {
            "type": chat_type.value,
            "$or": [
                {"participants": user_id},
                {"members": user_id},
                {"is_public": True} if chat_type == ChatType.channel else {}
            ],
            "is_archived": {"$ne": True}
        }
        
        cursor = chats_collection.find(query).sort("updated_at", -1)
        chats = []
        async for chat_data in cursor:
            chats.append(Chat(**chat_data))
        
        return chats