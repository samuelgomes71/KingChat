from typing import List, Optional
from datetime import datetime
from database import get_collection
from models import UserPrivacySettings, ContactPrivacySettings, ContactPrivacyUpdate, User
import uuid

class PrivacyService:
    @staticmethod
    async def get_user_privacy_settings(user_id: str) -> UserPrivacySettings:
        """Get user's privacy settings"""
        privacy_collection = await get_collection("user_privacy_settings")
        
        privacy_data = await privacy_collection.find_one({"user_id": user_id})
        if not privacy_data:
            # Create default privacy settings
            default_settings = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "default_show_read_receipts": True,
                "default_show_last_seen": True, 
                "default_show_online_status": True,
                "contact_settings": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await privacy_collection.insert_one(default_settings)
            return UserPrivacySettings(**default_settings)
        
        return UserPrivacySettings(**privacy_data)
    
    @staticmethod
    async def update_global_privacy_settings(user_id: str, updates: dict) -> UserPrivacySettings:
        """Update global privacy settings"""
        privacy_collection = await get_collection("user_privacy_settings")
        
        update_data = {k: v for k, v in updates.items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        await privacy_collection.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        return await PrivacyService.get_user_privacy_settings(user_id)
    
    @staticmethod
    async def update_contact_privacy_settings(user_id: str, contact_update: ContactPrivacyUpdate) -> UserPrivacySettings:
        """Update privacy settings for a specific contact"""
        privacy_collection = await get_collection("user_privacy_settings")
        
        # Get current settings
        privacy_settings = await PrivacyService.get_user_privacy_settings(user_id)
        
        # Find existing contact settings
        contact_settings = privacy_settings.contact_settings
        existing_contact_index = None
        
        for i, contact in enumerate(contact_settings):
            if contact.contact_user_id == contact_update.contact_user_id:
                existing_contact_index = i
                break
        
        # Prepare update data
        update_data = {k: v for k, v in contact_update.dict().items() if v is not None and k != 'contact_user_id'}
        
        if existing_contact_index is not None:
            # Update existing contact settings
            for key, value in update_data.items():
                contact_settings[existing_contact_index].__dict__[key] = value
        else:
            # Create new contact settings
            new_contact_settings = ContactPrivacySettings(
                contact_user_id=contact_update.contact_user_id,
                **update_data
            )
            contact_settings.append(new_contact_settings)
        
        # Update in database
        await privacy_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "contact_settings": [setting.dict() for setting in contact_settings],
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return await PrivacyService.get_user_privacy_settings(user_id)
    
    @staticmethod
    async def can_see_read_receipt(sender_id: str, receiver_id: str) -> bool:
        """Check if sender can see read receipt from receiver"""
        receiver_privacy = await PrivacyService.get_user_privacy_settings(receiver_id)
        
        # Check contact-specific settings
        for contact in receiver_privacy.contact_settings:
            if contact.contact_user_id == sender_id:
                return contact.show_read_receipts_to_contact
        
        # Fall back to global settings
        return receiver_privacy.default_show_read_receipts
    
    @staticmethod
    async def can_see_last_seen(viewer_id: str, target_id: str) -> bool:
        """Check if viewer can see target's last seen"""
        target_privacy = await PrivacyService.get_user_privacy_settings(target_id)
        
        # Check contact-specific settings
        for contact in target_privacy.contact_settings:
            if contact.contact_user_id == viewer_id:
                return contact.show_last_seen_to_contact
        
        # Fall back to global settings
        return target_privacy.default_show_last_seen
    
    @staticmethod
    async def can_see_online_status(viewer_id: str, target_id: str) -> bool:
        """Check if viewer can see target's online status"""
        target_privacy = await PrivacyService.get_user_privacy_settings(target_id)
        
        # Check contact-specific settings
        for contact in target_privacy.contact_settings:
            if contact.contact_user_id == viewer_id:
                return contact.show_online_status_to_contact
        
        # Fall back to global settings
        return target_privacy.default_show_online_status
    
    @staticmethod
    async def get_contact_privacy_settings(user_id: str, contact_id: str) -> ContactPrivacySettings:
        """Get privacy settings for a specific contact"""
        privacy_settings = await PrivacyService.get_user_privacy_settings(user_id)
        
        # Look for specific contact settings
        for contact in privacy_settings.contact_settings:
            if contact.contact_user_id == contact_id:
                return contact
        
        # Return default settings
        return ContactPrivacySettings(
            contact_user_id=contact_id,
            show_read_receipts_to_contact=privacy_settings.default_show_read_receipts,
            can_see_contact_read_receipts=True,  # Default: can see contact's read receipts
            show_last_seen_to_contact=privacy_settings.default_show_last_seen,
            can_see_contact_last_seen=True,  # Default: can see contact's last seen
            show_online_status_to_contact=privacy_settings.default_show_online_status,
            can_see_contact_online_status=True  # Default: can see contact's online status
        )