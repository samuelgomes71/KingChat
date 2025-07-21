from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from typing import List, Optional
import os
import logging
from pathlib import Path
from datetime import datetime
import asyncio
import uuid

# Import custom modules
from models import (
    User, UserCreate, UserUpdate, Chat, ChatCreate, ChatUpdate, 
    Message, MessageCreate, MessageUpdate, Folder, FolderCreate,
    ChatType, MessageType, FolderType, UserChats, MessageResponse,
    UserPrivacySettings, ContactPrivacyUpdate, PrivacySettingsUpdate,
    ForwardMessageRequest, ForwardMessageResponse, ContactForForward
)
from database import connect_to_mongo, close_mongo_connection, get_collection
from auth import get_current_user, create_demo_user, create_demo_token
from services.chat_service import ChatService
from services.message_service import MessageService
from services.privacy_service import PrivacyService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent
from dotenv import load_dotenv
load_dotenv(ROOT_DIR / '.env')

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    
    # Create demo user and initial data
    await create_demo_user()
    await create_initial_data()
    
    yield
    
    # Shutdown
    await close_mongo_connection()

# Create the main app
app = FastAPI(
    title="KingChat API",
    description="Backend API for KingChat - The Royal Messaging Experience",
    version="1.0.0",
    lifespan=lifespan
)

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoints
@api_router.get("/")
async def root():
    return {"message": "KingChat API is running! 👑"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "KingChat API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow()
    }

# Authentication endpoints
@api_router.post("/auth/demo-login")
async def demo_login():
    """Login as demo user for testing"""
    token = create_demo_token()
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": "demo_user_123",
            "name": "Usuário Demo",
            "username": "demo",
            "is_premium": True
        }
    }

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# User endpoints
@api_router.get("/users/chats", response_model=UserChats)
async def get_user_chats_with_folders(current_user: User = Depends(get_current_user)):
    """Get user's chats organized by folders"""
    # Get user's chats
    chats = await ChatService.get_user_chats(current_user.id)
    
    # Get user's folders
    folders_collection = await get_collection("folders")
    folders_data = await folders_collection.find({"user_id": current_user.id}).to_list(100)
    folders = [Folder(**folder_data) for folder_data in folders_data]
    
    # If no folders exist, create default ones
    if not folders:
        folders = await create_default_folders(current_user.id)
    
    return UserChats(user=current_user, chats=chats, folders=folders)

# Chat endpoints
@api_router.post("/chats", response_model=Chat)
async def create_chat(chat_data: ChatCreate, current_user: User = Depends(get_current_user)):
    """Create a new chat"""
    return await ChatService.create_chat(chat_data, current_user.id)

@api_router.get("/chats", response_model=List[Chat])
async def get_chats(
    chat_type: Optional[ChatType] = None,
    current_user: User = Depends(get_current_user)
):
    """Get user's chats, optionally filtered by type"""
    if chat_type:
        return await ChatService.get_chats_by_type(current_user.id, chat_type)
    return await ChatService.get_user_chats(current_user.id)

@api_router.get("/chats/{chat_id}", response_model=Chat)
async def get_chat(chat_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific chat"""
    chat = await ChatService.get_chat_by_id(chat_id, current_user.id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@api_router.put("/chats/{chat_id}", response_model=Chat)
async def update_chat(
    chat_id: str, 
    chat_update: ChatUpdate, 
    current_user: User = Depends(get_current_user)
):
    """Update a chat"""
    chat = await ChatService.update_chat(chat_id, chat_update, current_user.id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or no permission")
    return chat

@api_router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, current_user: User = Depends(get_current_user)):
    """Delete a chat"""
    success = await ChatService.delete_chat(chat_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Chat not found or no permission")
    return {"message": "Chat deleted successfully"}

@api_router.post("/chats/{chat_id}/join")
async def join_chat(chat_id: str, current_user: User = Depends(get_current_user)):
    """Join a public chat/channel"""
    success = await ChatService.join_chat(chat_id, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot join this chat")
    return {"message": "Successfully joined chat"}

@api_router.post("/chats/{chat_id}/leave")
async def leave_chat(chat_id: str, current_user: User = Depends(get_current_user)):
    """Leave a chat"""
    success = await ChatService.leave_chat(chat_id, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot leave this chat")
    return {"message": "Successfully left chat"}

# Message endpoints
@api_router.post("/chats/{chat_id}/messages", response_model=MessageResponse)
async def send_message(
    chat_id: str, 
    message_data: MessageCreate, 
    current_user: User = Depends(get_current_user)
):
    """Send a message to a chat"""
    message_data.chat_id = chat_id
    message = await MessageService.create_message(message_data, current_user.id, current_user.name)
    if not message:
        raise HTTPException(status_code=400, detail="Cannot send message to this chat")
    
    # Get reply-to message if exists
    reply_to_message = None
    if message.reply_to:
        reply_to_message = await MessageService.get_message_by_id(message.reply_to, current_user.id)
    
    return MessageResponse(message=message, reply_to_message=reply_to_message)

@api_router.get("/chats/{chat_id}/messages", response_model=List[Message])
async def get_chat_messages(
    chat_id: str,
    limit: int = 50,
    before: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get messages from a chat"""
    return await MessageService.get_chat_messages(chat_id, current_user.id, limit, before)

@api_router.put("/messages/{message_id}", response_model=Message)
async def update_message(
    message_id: str,
    message_update: MessageUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a message"""
    message = await MessageService.update_message(message_id, message_update, current_user.id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found or no permission")
    return message

@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str, current_user: User = Depends(get_current_user)):
    """Delete a message"""
    success = await MessageService.delete_message(message_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found or no permission")
    return {"message": "Message deleted successfully"}

@api_router.post("/messages/{message_id}/read")
async def mark_message_as_read(message_id: str, current_user: User = Depends(get_current_user)):
    """Mark a message as read"""
    message = await MessageService.get_message_by_id(message_id, current_user.id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    success = await MessageService.mark_as_read(message.chat_id, current_user.id, [message_id])
    if not success:
        raise HTTPException(status_code=400, detail="Cannot mark message as read")
    return {"message": "Message marked as read"}

@api_router.post("/messages/{message_id}/react")
async def add_reaction_to_message(
    message_id: str,
    emoji: str,
    current_user: User = Depends(get_current_user)
):
    """Add reaction to a message"""
    message = await MessageService.add_reaction(message_id, emoji, current_user.id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message

@api_router.delete("/messages/{message_id}/react/{emoji}")
async def remove_reaction_from_message(
    message_id: str,
    emoji: str,
    current_user: User = Depends(get_current_user)
):
    """Remove reaction from a message"""
    message = await MessageService.remove_reaction(message_id, emoji, current_user.id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message

@api_router.post("/messages/{message_id}/forward")
async def forward_message(
    message_id: str,
    target_chat_id: str,
    current_user: User = Depends(get_current_user)
):
    """Forward a message to another chat"""
    message = await MessageService.forward_message(message_id, target_chat_id, current_user.id, current_user.name)
    if not message:
        raise HTTPException(status_code=400, detail="Cannot forward this message")
    return message

# Search endpoints
@api_router.get("/search/messages", response_model=List[Message])
async def search_messages(
    q: str,
    chat_id: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Search messages"""
    return await MessageService.search_messages(q, chat_id, current_user.id, limit)

# Folder endpoints
@api_router.get("/folders", response_model=List[Folder])
async def get_folders(current_user: User = Depends(get_current_user)):
    """Get user's chat folders"""
    folders_collection = await get_collection("folders")
    folders_data = await folders_collection.find({"user_id": current_user.id}).to_list(100)
    folders = [Folder(**folder_data) for folder_data in folders_data]
    
    if not folders:
        folders = await create_default_folders(current_user.id)
    
    return folders

@api_router.post("/folders", response_model=Folder)
async def create_folder(folder_data: FolderCreate, current_user: User = Depends(get_current_user)):
    """Create a new folder"""
    folders_collection = await get_collection("folders")
    
    folder_dict = folder_data.dict()
    folder_dict["id"] = str(uuid.uuid4())
    folder_dict["user_id"] = current_user.id
    folder_dict["created_at"] = datetime.utcnow()
    
    await folders_collection.insert_one(folder_dict)
    return Folder(**folder_dict)

# Include the router in the main app
app.include_router(api_router)

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Helper functions
async def create_default_folders(user_id: str) -> List[Folder]:
    """Create default folders for a user"""
    folders_collection = await get_collection("folders")
    
    default_folders = [
        {
            "id": f"{user_id}_folder_all",
            "user_id": user_id,
            "name": "Todas as Conversas",
            "folder_type": FolderType.all,
            "icon": "💬",
            "is_default": True,
            "order": 0,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"{user_id}_folder_unread",
            "user_id": user_id,
            "name": "Não Lidas",
            "folder_type": FolderType.unread,
            "icon": "🔴",
            "is_default": True,
            "order": 1,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"{user_id}_folder_channels",
            "user_id": user_id,
            "name": "Canais",
            "folder_type": FolderType.channels,
            "icon": "📢",
            "is_default": True,
            "order": 2,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"{user_id}_folder_bots",
            "user_id": user_id,
            "name": "Bots",
            "folder_type": FolderType.bots,
            "icon": "🤖",
            "is_default": True,
            "order": 3,
            "created_at": datetime.utcnow()
        },
        {
            "id": f"{user_id}_folder_groups",
            "user_id": user_id,
            "name": "Grupos",
            "folder_type": FolderType.groups,
            "icon": "👥",
            "is_default": True,
            "order": 4,
            "created_at": datetime.utcnow()
        }
    ]
    
    await folders_collection.insert_many(default_folders)
    return [Folder(**folder_data) for folder_data in default_folders]

async def create_initial_data():
    """Create initial demo data"""
    try:
        chats_collection = await get_collection("chats")
        messages_collection = await get_collection("messages")
        
        # Check if initial data already exists
        existing_chat = await chats_collection.find_one({"id": "demo_chat_1"})
        if existing_chat:
            return
        
        # Create demo chats
        demo_chats = [
            {
                "id": "demo_chat_1",
                "name": "Maria Silva",
                "type": "private",
                "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b892?w=150&h=150&fit=crop&crop=face",
                "participants": ["demo_user_123", "user_maria"],
                "is_online": True,
                "last_message": "Oi! Como você está?",
                "last_message_time": datetime.utcnow(),
                "unread_count": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "demo_chat_2",
                "name": "Canal Tech News 📢",
                "type": "channel",
                "avatar": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=150&h=150&fit=crop",
                "members": ["demo_user_123"],
                "admins": ["admin_user"],
                "owner": "admin_user",
                "subscribers_count": 15420,
                "is_public": True,
                "last_message": "Breaking: Nova atualização revolucionária lançada!",
                "last_message_time": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "demo_chat_3",
                "name": "🤖 AssistentBot",
                "type": "bot",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                "participants": ["demo_user_123", "bot_assistant"],
                "is_verified": True,
                "bot_commands": ["/help", "/weather", "/news", "/joke"],
                "last_message": "Como posso ajudar você hoje?",
                "last_message_time": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "demo_chat_4",
                "name": "Grupo Família 👨‍👩‍👧‍👦",
                "type": "group",
                "avatar": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150&h=150&fit=crop&crop=faces",
                "members": ["demo_user_123", "user_mae", "user_pedro"],
                "admins": ["user_mae"],
                "owner": "user_mae",
                "last_message": "Pedro: Vai ter churrasco no domingo!",
                "last_message_time": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        await chats_collection.insert_many(demo_chats)
        
        # Create demo messages
        demo_messages = [
            {
                "id": "demo_msg_1",
                "chat_id": "demo_chat_1",
                "sender_id": "user_maria",
                "sender_name": "Maria Silva",
                "text": "Oi! Como você está?",
                "message_type": "text",
                "timestamp": datetime.utcnow(),
                "read_by": ["user_maria"]
            },
            {
                "id": "demo_msg_2",
                "chat_id": "demo_chat_2",
                "sender_id": "admin_user",
                "sender_name": "Admin",
                "text": "🚀 BREAKING: Nova atualização revolucionária do KingChat!",
                "message_type": "text",
                "is_channel_post": True,
                "timestamp": datetime.utcnow(),
                "read_by": ["admin_user"]
            },
            {
                "id": "demo_msg_3",
                "chat_id": "demo_chat_3",
                "sender_id": "bot_assistant",
                "sender_name": "AssistentBot",
                "text": "Olá! Sou seu assistente pessoal do KingChat 🤖",
                "message_type": "text",
                "is_bot": True,
                "timestamp": datetime.utcnow(),
                "read_by": ["bot_assistant"]
            }
        ]
        
        await messages_collection.insert_many(demo_messages)
        
        logger.info("✅ Initial demo data created successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to create initial data: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
