import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

db = Database()

async def get_database():
    if db.database is None:
        raise Exception("Database not initialized")
    return db.database

async def connect_to_mongo():
    """Create database connection"""
    try:
        db.client = AsyncIOMotorClient(os.environ.get("MONGO_URL"))
        db.database = db.client[os.environ.get("DB_NAME")]
        
        # Test connection
        await db.database.command("ping")
        logger.info("✅ Successfully connected to MongoDB")
        
        # Create indexes for better performance
        await create_indexes()
        
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("✅ Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        database = await get_database()
        
        # Users indexes
        await database.users.create_index("username", unique=True, sparse=True)
        await database.users.create_index("email", unique=True, sparse=True)
        
        # Chats indexes
        await database.chats.create_index("participants")
        await database.chats.create_index("members")
        await database.chats.create_index("type")
        await database.chats.create_index("is_public")
        await database.chats.create_index("updated_at")
        
        # Messages indexes
        await database.messages.create_index([("chat_id", 1), ("timestamp", -1)])
        await database.messages.create_index("sender_id")
        await database.messages.create_index("reply_to")
        await database.messages.create_index("scheduled_for")
        await database.messages.create_index([("text", "text")])  # Text search
        
        # Folders indexes
        await database.folders.create_index([("user_id", 1), ("folder_type", 1)])
        
        # Polls indexes
        await database.polls.create_index("message_id")
        
        logger.info("✅ Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to create indexes: {e}")

# Helper functions for database operations
async def get_collection(collection_name: str):
    """Get a database collection"""
    database = await get_database()
    return database[collection_name]