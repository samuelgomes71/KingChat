from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

# Enums
class ChatType(str, Enum):
    private = "private"
    group = "group"
    channel = "channel"
    bot = "bot"

class MessageType(str, Enum):
    text = "text"
    image = "image"
    file = "file"
    audio = "audio"
    video = "video"
    poll = "poll"
    system = "system"

class FolderType(str, Enum):
    all = "all"
    unread = "unread"
    channels = "channels"
    bots = "bots"
    groups = "groups"
    archived = "archived"

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    username: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    is_premium: bool = False
    is_online: bool = False
    last_seen: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    username: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None

# Chat Models
class Chat(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: ChatType
    description: Optional[str] = None
    avatar: Optional[str] = None
    
    # Private chat
    participants: List[str] = []  # User IDs
    
    # Group/Channel specific
    members: List[str] = []  # User IDs
    admins: List[str] = []   # User IDs
    owner: Optional[str] = None  # User ID
    subscribers_count: int = 0
    
    # Bot specific
    bot_commands: List[str] = []
    bot_description: Optional[str] = None
    
    # Chat settings
    is_public: bool = False
    has_secret_chat: bool = False
    is_verified: bool = False
    is_archived: bool = False
    is_pinned: bool = False
    is_muted: bool = False
    
    # Last activity
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatCreate(BaseModel):
    name: str
    type: ChatType
    description: Optional[str] = None
    avatar: Optional[str] = None
    participants: List[str] = []
    is_public: bool = False

class ChatUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    avatar: Optional[str] = None

# Message Models
class MessageReaction(BaseModel):
    emoji: str
    users: List[str] = []  # User IDs
    count: int = 0

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chat_id: str
    sender_id: str
    sender_name: str
    
    # Message content
    text: Optional[str] = None
    message_type: MessageType = MessageType.text
    media_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    
    # Message features
    reply_to: Optional[str] = None  # Message ID
    forwarded_from: Optional[str] = None  # User ID
    is_edited: bool = False
    is_deleted: bool = False
    is_pinned: bool = False
    is_system: bool = False
    is_bot_command: bool = False
    
    # Secret chat features
    is_secret: bool = False
    self_destruct: Optional[str] = None  # "5m", "1h", "1d", etc.
    
    # Scheduled messages
    scheduled_for: Optional[datetime] = None
    is_scheduled: bool = False
    
    # Bot features
    quick_replies: List[str] = []
    
    # Reactions
    reactions: List[MessageReaction] = []
    
    # Timestamps
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    edited_at: Optional[datetime] = None
    read_by: List[str] = []  # User IDs who read the message

class MessageCreate(BaseModel):
    chat_id: str
    text: Optional[str] = None
    message_type: MessageType = MessageType.text
    media_url: Optional[str] = None
    reply_to: Optional[str] = None
    is_secret: bool = False
    self_destruct: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    quick_replies: List[str] = []

class MessageUpdate(BaseModel):
    text: Optional[str] = None
    is_pinned: Optional[bool] = None

class MessageReactionUpdate(BaseModel):
    emoji: str
    action: str  # "add" or "remove"

# Folder Models
class Folder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    folder_type: FolderType
    icon: str
    chat_ids: List[str] = []
    is_default: bool = False
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FolderCreate(BaseModel):
    name: str
    folder_type: FolderType
    icon: str
    chat_ids: List[str] = []

# Poll Models
class PollOption(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    votes: List[str] = []  # User IDs
    count: int = 0

class Poll(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    message_id: str
    question: str
    options: List[PollOption]
    is_anonymous: bool = True
    is_closed: bool = False
    multiple_choice: bool = False
    total_votes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    closed_at: Optional[datetime] = None

class PollCreate(BaseModel):
    question: str
    options: List[str]  # Option texts
    is_anonymous: bool = True
    multiple_choice: bool = False

class PollVote(BaseModel):
    option_ids: List[str]

# Response Models
class ChatWithMessages(BaseModel):
    chat: Chat
    messages: List[Message] = []
    unread_count: int = 0

class UserChats(BaseModel):
    user: User
    chats: List[Chat]
    folders: List[Folder]

class MessageResponse(BaseModel):
    message: Message
    reply_to_message: Optional[Message] = None

# Search Models
class SearchResult(BaseModel):
    messages: List[Message] = []
    chats: List[Chat] = []
    users: List[User] = []
    total: int = 0

class SearchRequest(BaseModel):
    query: str
    chat_id: Optional[str] = None
    message_type: Optional[MessageType] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    limit: int = 50