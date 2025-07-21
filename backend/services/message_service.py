from typing import List, Optional
from datetime import datetime
from database import get_collection
from models import Message, MessageCreate, MessageUpdate, MessageReactionUpdate, MessageType
from services.chat_service import ChatService
import uuid

class MessageService:
    @staticmethod
    async def create_message(message_data: MessageCreate, sender_id: str, sender_name: str) -> Optional[Message]:
        """Create a new message"""
        messages_collection = await get_collection("messages")
        
        # Verify user has access to chat
        chat = await ChatService.get_chat_by_id(message_data.chat_id, sender_id)
        if not chat:
            return None
        
        # Check if it's a scheduled message
        if message_data.scheduled_for and message_data.scheduled_for > datetime.utcnow():
            is_scheduled = True
        else:
            is_scheduled = False
        
        message_dict = message_data.dict()
        message_dict["id"] = str(uuid.uuid4())
        message_dict["sender_id"] = sender_id
        message_dict["sender_name"] = sender_name
        message_dict["timestamp"] = datetime.utcnow()
        message_dict["is_scheduled"] = is_scheduled
        message_dict["read_by"] = [sender_id]  # Mark as read by sender
        
        # Handle bot commands
        if message_data.text and message_data.text.startswith('/') and chat.type == "bot":
            message_dict["is_bot_command"] = True
        
        await messages_collection.insert_one(message_dict)
        message = Message(**message_dict)
        
        # Update chat's last message (only if not scheduled)
        if not is_scheduled:
            await ChatService.update_last_message(
                message_data.chat_id, 
                message_data.text or "Media", 
                message.timestamp
            )
        
        return message
    
    @staticmethod
    async def get_chat_messages(chat_id: str, user_id: str, limit: int = 50, before_message_id: Optional[str] = None) -> List[Message]:
        """Get messages from a chat"""
        # Verify user has access to chat
        chat = await ChatService.get_chat_by_id(chat_id, user_id)
        if not chat:
            return []
        
        messages_collection = await get_collection("messages")
        
        query = {
            "chat_id": chat_id,
            "is_deleted": {"$ne": True},
            "is_scheduled": {"$ne": True}
        }
        
        # Pagination - get messages before a specific message
        if before_message_id:
            before_message = await messages_collection.find_one({"id": before_message_id})
            if before_message:
                query["timestamp"] = {"$lt": before_message["timestamp"]}
        
        cursor = messages_collection.find(query).sort("timestamp", -1).limit(limit)
        messages = []
        async for message_data in cursor:
            messages.append(Message(**message_data))
        
        # Return in chronological order
        return list(reversed(messages))
    
    @staticmethod
    async def get_message_by_id(message_id: str, user_id: str) -> Optional[Message]:
        """Get a specific message by ID"""
        messages_collection = await get_collection("messages")
        
        message_data = await messages_collection.find_one({"id": message_id})
        if not message_data:
            return None
        
        message = Message(**message_data)
        
        # Verify user has access to the chat
        chat = await ChatService.get_chat_by_id(message.chat_id, user_id)
        if not chat:
            return None
        
        return message
    
    @staticmethod
    async def update_message(message_id: str, message_update: MessageUpdate, user_id: str) -> Optional[Message]:
        """Update a message (only sender can edit)"""
        messages_collection = await get_collection("messages")
        
        message = await MessageService.get_message_by_id(message_id, user_id)
        if not message or message.sender_id != user_id:
            return None
        
        update_data = {k: v for k, v in message_update.dict().items() if v is not None}
        update_data["is_edited"] = True
        update_data["edited_at"] = datetime.utcnow()
        
        await messages_collection.update_one(
            {"id": message_id},
            {"$set": update_data}
        )
        
        return await MessageService.get_message_by_id(message_id, user_id)
    
    @staticmethod
    async def delete_message(message_id: str, user_id: str) -> bool:
        """Delete a message (sender or chat admin can delete)"""
        messages_collection = await get_collection("messages")
        
        message = await MessageService.get_message_by_id(message_id, user_id)
        if not message:
            return False
        
        chat = await ChatService.get_chat_by_id(message.chat_id, user_id)
        if not chat:
            return False
        
        # Check if user can delete (sender, admin, or owner)
        can_delete = (
            message.sender_id == user_id or 
            user_id in chat.admins or 
            chat.owner == user_id
        )
        
        if not can_delete:
            return False
        
        await messages_collection.update_one(
            {"id": message_id},
            {"$set": {"is_deleted": True, "updated_at": datetime.utcnow()}}
        )
        
        return True
    
    @staticmethod
    async def mark_as_read(chat_id: str, user_id: str, message_ids: List[str] = None) -> bool:
        """Mark messages as read"""
        messages_collection = await get_collection("messages")
        
        # Verify user has access to chat
        chat = await ChatService.get_chat_by_id(chat_id, user_id)
        if not chat:
            return False
        
        query = {"chat_id": chat_id}
        if message_ids:
            query["id"] = {"$in": message_ids}
        else:
            # Mark all unread messages as read
            query["read_by"] = {"$ne": user_id}
        
        await messages_collection.update_many(
            query,
            {"$addToSet": {"read_by": user_id}}
        )
        
        return True
    
    @staticmethod
    async def add_reaction(message_id: str, emoji: str, user_id: str) -> Optional[Message]:
        """Add reaction to a message"""
        messages_collection = await get_collection("messages")
        
        message = await MessageService.get_message_by_id(message_id, user_id)
        if not message:
            return None
        
        # Check if user already reacted with this emoji
        await messages_collection.update_one(
            {
                "id": message_id,
                "reactions.emoji": {"$ne": emoji}
            },
            {
                "$push": {
                    "reactions": {
                        "emoji": emoji,
                        "users": [user_id],
                        "count": 1
                    }
                }
            }
        )
        
        # Update existing reaction
        await messages_collection.update_one(
            {
                "id": message_id,
                "reactions.emoji": emoji,
                "reactions.users": {"$ne": user_id}
            },
            {
                "$push": {"reactions.$.users": user_id},
                "$inc": {"reactions.$.count": 1}
            }
        )
        
        return await MessageService.get_message_by_id(message_id, user_id)
    
    @staticmethod
    async def remove_reaction(message_id: str, emoji: str, user_id: str) -> Optional[Message]:
        """Remove reaction from a message"""
        messages_collection = await get_collection("messages")
        
        message = await MessageService.get_message_by_id(message_id, user_id)
        if not message:
            return None
        
        # Remove user from reaction
        await messages_collection.update_one(
            {
                "id": message_id,
                "reactions.emoji": emoji,
                "reactions.users": user_id
            },
            {
                "$pull": {"reactions.$.users": user_id},
                "$inc": {"reactions.$.count": -1}
            }
        )
        
        # Remove reaction if no users left
        await messages_collection.update_one(
            {"id": message_id},
            {"$pull": {"reactions": {"count": 0}}}
        )
        
        return await MessageService.get_message_by_id(message_id, user_id)
    
    @staticmethod
    async def forward_message_unlimited(message_id: str, target_chat_ids: List[str], user_id: str, sender_name: str, add_caption: Optional[str] = None) -> dict:
        """Forward a message to unlimited chats (KingChat advantage over WhatsApp)"""
        original_message = await MessageService.get_message_by_id(message_id, user_id)
        if not original_message:
            return {
                "successful_forwards": [],
                "failed_forwards": [{"chat_id": "unknown", "error": "Original message not found"}],
                "total_sent": 0,
                "total_failed": 1
            }
        
        successful_forwards = []
        failed_forwards = []
        
        for target_chat_id in target_chat_ids:
            try:
                # Check if user has access to target chat
                target_chat = await ChatService.get_chat_by_id(target_chat_id, user_id)
                if not target_chat:
                    failed_forwards.append({
                        "chat_id": target_chat_id,
                        "error": "Chat not found or no access"
                    })
                    continue
                
                # Prepare message text
                message_text = original_message.text
                if add_caption and add_caption.strip():
                    message_text = f"{add_caption}\n\n--- Mensagem encaminhada ---\n{original_message.text}"
                
                # Create forwarded message
                forwarded_data = MessageCreate(
                    chat_id=target_chat_id,
                    text=message_text,
                    message_type=original_message.message_type,
                    media_url=original_message.media_url
                )
                
                message = await MessageService.create_message(forwarded_data, user_id, sender_name)
                if message:
                    # Mark as forwarded
                    messages_collection = await get_collection("messages")
                    await messages_collection.update_one(
                        {"id": message.id},
                        {"$set": {"forwarded_from": original_message.sender_id, "is_forwarded": True}}
                    )
                    successful_forwards.append(target_chat_id)
                else:
                    failed_forwards.append({
                        "chat_id": target_chat_id,
                        "error": "Failed to create forwarded message"
                    })
                
            except Exception as e:
                failed_forwards.append({
                    "chat_id": target_chat_id,
                    "error": str(e)
                })
        
        return {
            "successful_forwards": successful_forwards,
            "failed_forwards": failed_forwards,
            "total_sent": len(successful_forwards),
            "total_failed": len(failed_forwards)
        }
    
    @staticmethod
    async def search_messages(query: str, chat_id: Optional[str] = None, user_id: str = None, limit: int = 50) -> List[Message]:
        """Search messages by text"""
        messages_collection = await get_collection("messages")
        
        search_query = {
            "$text": {"$search": query},
            "is_deleted": {"$ne": True}
        }
        
        if chat_id:
            # Verify user has access to chat
            chat = await ChatService.get_chat_by_id(chat_id, user_id)
            if chat:
                search_query["chat_id"] = chat_id
        
        cursor = messages_collection.find(search_query).sort("timestamp", -1).limit(limit)
        messages = []
        async for message_data in cursor:
            messages.append(Message(**message_data))
        
        return messages